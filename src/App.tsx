
import './App.css'
import { Button } from "./components/ui/button"
import { ThemeProvider } from "./components/theme-provider"
import { Navbar } from './components/ui/navbar'
import { Input } from "./components/ui/input"
import { Separator } from './components/ui/separator'
import { Switch } from "./components/ui/switch"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select"

import { set, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./components/ui/form"

import { writeTextFile } from '@tauri-apps/api/fs';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from "@tauri-apps/api/event";

// var spawn = require("child_process").spawn;
import { useState, useEffect } from 'react';
import LaunchAlert from './components/alert-launch';
import DownloadAlert from './components/alert-download';
import { Command } from '@tauri-apps/api/shell'
import { get } from 'http'

function App() {

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [powershellOutput, setPowershellOutput] = useState({stdout: '', stderr: ''});
  const [downlooadLink, setDownloadLink] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(false);
  const [added, setAdded] = useState(false);
  const [boxnameState, setBoxname] = useState('');
  const [providerState, setProvider] = useState('');

  const formSchema = z.object({
    boxname: z.string().nonempty(),
    author: z.any(),
    provider: z.enum(['vmware_desktop', 'vmware_fusion', 'vmware_workstation'] as const),
    boxversion: z.string().nonempty(),
    vmname: z.string().nonempty(),
    hostname: z.string().nonempty(),
    ip_address: z.string(),
    cpu: z.string().nonempty(),
    cpucores: z.string().nonempty(),
    memory: z.string().nonempty(),
    gui: z.boolean()
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      boxname: "",
      author: "",
      provider: "vmware_desktop",
      boxversion: "",
      vmname: "",
      hostname: "",
      ip_address: "",
      cpu: "1",
      cpucores: "1",
      memory: "512",
      gui: false
    }
  })

  interface ProgressEventPayload {
    progress: number;
  }

  interface ProgressEventProps {
    payload: ProgressEventPayload;
  }

  function vagrantUpBox() {
    const powershellCommand = new Command('vagrant', ['up']);
    setIsNotificationOpen(true);
    powershellCommand.execute()
    .then((output) => {
      console.log(output);
      if (output.stderr) {
        setPowershellOutput({stdout: '', stderr: output.stderr});
      }
      else {
        setPowershellOutput({stdout: output.stdout, stderr: ''});
      }
    })
  }  

  function vagrantAddBox(boxname: string, provider: string) {
    // vagrant box add StefanScherer/windows_2019 windows_2019 --provider=vmware_desktop
    const powershellCommand = new Command('vagrant', ['box', 'add', boxname, boxname.split('/')[1] , '--provider', provider]);
    powershellCommand.execute()
    .then((output) => {
      console.log(output);
      setAdded(true);
    })
  }
  

  useEffect(() => {
    const unListen = listen("PROGRESS", (e: ProgressEventProps) => {
      setProgress(e.payload.progress);
      if (e.payload.progress === 100) {
        setIsDownloading(false);
        setDownloaded(true);
      }
    });

    return () => {
      unListen.then((f) => f());
    };
  }, []);

  useEffect(() => {
    if (downloaded) {
      // vagrantUpBox();
      vagrantAddBox(boxnameState, providerState)
      setDownloaded(false);
    }
  }, [downloaded]);

  useEffect(() => {
    if(added) {
      vagrantUpBox();
      setAdded(false);
    }
  }, [added]);

  function getAuthor(boxname: string) {
    const author = boxname.split('/')[0];
    const box = boxname.split('/')[1];
    return [author, box]
  }

  async function downloadFile(url: string, name: string) {
            
    setIsDownloading(true);

    const appWindow = import("@tauri-apps/api/window");
    invoke("progress_tracker", {
      window: appWindow,
      url,
      name: name,
    });
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    
    async function getLocalBoxes(boxname: string, provider: string) {
      const boxes: Array<string> = [];
      const powershellCommand = new Command('vagrant', ['box', 'list']);
      // const powershellCommand = new Command('vagrant', ['box', 'add', boxname, '--provider', 'vmware_desktop']);
      powershellCommand.execute()
      .then((output) => {
        output.stdout.split('\n').forEach((line) => {
          boxes.push(line.split(' ')[0]);
        });
      }).then(() => {
        if (!boxes.includes(boxname)) {
          setBoxname(boxname);
          setProvider(provider);
          [values.author, values.boxname] = getAuthor(values.boxname);
          console.log(values);
          const url = `https://app.vagrantup.com/${values.author}/boxes/${values.boxname}/versions/${values.boxversion}/providers/${values.provider}.box`;
          setDownloadLink(url);
      
          downloadFile(url, values.boxname)

          return;
        }else {
          // vagrantUpBox()
          setAdded(true);
          return;
        }
      }).catch((error) => {
        alert(error);
      }).finally(() => {
        return;
      });
    }

    getLocalBoxes(values.boxname, values.provider);   
    
    console.log(values);

    const content = `
          Vagrant.configure('2') do |config|
          config.vm.box = '${values.boxname}'
          config.vm.hostname = '${values.hostname}'
          config.vm.define "${values.vmname}"
          config.winrm.timeout = 1800
          config.vm.boot_timeout = 1800
          ${values.ip_address ? `config.vm.network "private_network", ip: "${values.ip_address}"` : ''}
          config.vm.provider "vmware_workstation" do |v|
            v.gui = ${values.gui}
            v.vmx["memsize"] = "${values.memory}"
            v.vmx["numvcpus"] = "${values.cpu}"
            v.vmx["cpuid.coresPerSocket"] = "${values.cpucores}"
          end
        end
          `;
          
          // setIsNotificationOpen(true);
          
          writeTextFile({
            path: `Vagrantfile`,
            contents: content,
          }).then(() => {
            // alert('Your VM is ready to be launched !');
          }).catch((error) => {
            alert(error);
          });
          // vagrantUpBox()

  }

  
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">

      <LaunchAlert isOpen={isNotificationOpen} setIsOpen={setIsNotificationOpen} psContent={powershellOutput} />
      <DownloadAlert isOpen={isDownloading} setIsOpen={setIsDownloading} progress={progress} />

      <Navbar />
      <main className='p-8 w-full'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center' >Create your VM <span className='ml-auto cursor-pointer'>
            {/* <Modal/> */}
            </span>  </CardTitle>
          <CardDescription>Fill the differents settings to run now 🚀✨</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-2 -mt-5'>
              <div className='flex gap-4'>
                <div className='w-1/2'>
                  <FormField
                    control={form.control}
                    name="boxname"
                    render={({ field}) => (
                      <FormItem>
                        <FormLabel htmlFor="boxname">Vagrant Box name</FormLabel>
                        <div className='relative' >
                          <FormControl>
                            <Input autoComplete='off' {...field} defaultValue="" type="text" id="boxname" placeholder="ubuntu/trusty64" />
                          </FormControl>
                          {/* <Button onClick={getLastVersion()} className='absolute top-1.5 right-2 w-7 h-7 p-0'>X</Button> */}
                        </div>
                        <FormMessage>{form.formState.errors.boxname?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
                <div className='w-1/4'>
                  <FormField
                    control={form.control}
                    name="boxversion"
                    render={({ field}) => (
                      <FormItem>
                        <FormLabel htmlFor="boxversion">Vagrant Box version</FormLabel>
                        <FormControl>
                          <Input autoComplete='off' {...field} defaultValue="" type="text" id="boxversion" placeholder="1.0.0" />
                        </FormControl>
                        <FormMessage>{form.formState.errors.boxversion?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
                <Separator orientation="vertical" className='h-10 mt-auto' />
                <div className='w-1/2'>
                  <FormField
                    control={form.control}
                    name="vmname"
                    render={({ field}) => (
                      <FormItem>
                        <FormLabel htmlFor="vmname">VM Name</FormLabel>
                        <FormControl>
                          <Input autoComplete='off' {...field} defaultValue="" type="text" id="vmname" placeholder="My VM" />
                        </FormControl>
                        <FormMessage>{form.formState.errors.vmname?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <Separator className="mt-2"/>
              <div className='flex gap-4'>
                
                <div className='w-1/2'>
                  <FormField
                    control={form.control}
                    name="hostname"
                    render={({ field}) => (
                      <FormItem>
                        <FormLabel htmlFor="hostname">Hostname</FormLabel>
                        <FormControl>
                          <Input autoComplete='off' {...field} defaultValue="" type="text" id="hostname" placeholder="SRV-UBUNTU" />
                        </FormControl>
                        <FormMessage>{form.formState.errors.hostname?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
                <div className='w-1/2'>
                  <FormField
                    control={form.control}
                    name="ip_address"
                    render={({ field}) => (
                      <FormItem>
                        <FormLabel htmlFor="ip_address">IP Address (optional)</FormLabel>
                        <FormControl>
                          <Input autoComplete='off' {...field} defaultValue="" type="text" id="vmname" placeholder="192.168.1.10" />
                        </FormControl>
                        <FormMessage>{form.formState.errors.vmname?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className='flex gap-4 '>
                <div>
                  <FormField
                    control={form.control}
                    name="cpu"
                    render={({ field}) => (
                      <FormItem>
                        <FormLabel htmlFor="cpu">CPUs</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} {...field}>
                        <FormControl>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Pick a value.." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="6">6</SelectItem>
                              <SelectItem value="7">7</SelectItem>
                              <SelectItem value="8">8</SelectItem>
                            </SelectContent>
                        </Select>
                        {/* <FormDescription>Enter the number of CPUs</FormDescription> */}
                        <FormMessage>{form.formState.errors.cpu?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="cpucores"
                    render={({ field}) => (
                      <FormItem>
                        <FormLabel htmlFor="cpucores">Cores per CPU</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} {...field}>
                          <FormControl>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Pick a value.." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="6">6</SelectItem>
                              <SelectItem value="7">7</SelectItem>
                              <SelectItem value="8">8</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage>{form.formState.errors.cpucores?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="memory"
                    render={({ field}) => (
                      <FormItem>
                        <FormLabel htmlFor="memory">Memory</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} {...field}>
                          <FormControl>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Pick a value.." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="512">512Mb</SelectItem>
                              <SelectItem value="1024">1Gb</SelectItem>
                              <SelectItem value="2048">2Gb</SelectItem>
                              <SelectItem value="3072">3Gb</SelectItem>
                              <SelectItem value="4096">4Gb</SelectItem>
                              <SelectItem value="5120">5Gb</SelectItem>
                              <SelectItem value="6144">6Gb</SelectItem>
                              <SelectItem value="7168">7Gb</SelectItem>
                              <SelectItem value="8192">8Gb</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage>{form.formState.errors.memory?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex items-end space-x-2 pb-2">
                  <FormField
                    control={form.control}
                    name="gui"
                    render={({ field}) => (
                      <FormItem>
                        <FormLabel htmlFor="gui">Launch GUI</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage>{form.formState.errors.gui?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div>
                <Button type="submit" className="mt-4">Submit your VM 🎉</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      </main>
      <footer className='-mt-2 justify-center'>
        <p className='text-center text-gray-400'>Made with ❤️ by <a href="https://github.com/erwanclx/" target='_blank' className='text-blue-400'>Erwan Cloux</a></p>
      </footer>
    </ThemeProvider>
  )
}

export default App
