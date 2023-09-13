
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

import { useForm } from 'react-hook-form';
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
import { Command } from '@tauri-apps/api/shell';
// import { writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';

// var spawn = require("child_process").spawn;
import { useState } from 'react';
import LaunchAlert from './components/alert-launch';

function App() {

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [powershellOutput, setPowershellOutput] = useState({stdout: '', stderr: ''});

  const formSchema = z.object({
    boxname: z.string().nonempty(),
    boxversion: z.string().nonempty(),
    vmname: z.string().nonempty(),
    hostname: z.string().nonempty(),
    cpu: z.string().nonempty(),
    cpucores: z.string().nonempty(),
    memory: z.string().nonempty(),
    gui: z.boolean()
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      boxname: "",
      boxversion: "",
      vmname: "",
      hostname: "",
      cpu: "1",
      cpucores: "1",
      memory: "512",
      gui: false
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Write a file
    const content = `
    Vagrant.configure('2') do |config|
    config.vm.box = '${values.boxname}'
    config.vm.hostname = '${values.hostname}'
    config.vm.define "${values.vmname}"
    config.winrm.timeout = 1800
    config.vm.boot_timeout = 1800
    config.vm.provider "vmware_workstation" do |v|
      v.gui = ${values.gui}
      v.vmx["memsize"] = "${values.memory}"
      v.vmx["numvcpus"] = "${values.cpu}"
      v.vmx["cpuid.coresPerSocket"] = "${values.cpucores}"
    end
  end
    `;
    
    setIsNotificationOpen(true);
    // alert('Your VM is being created, please wait a few seconds');
    
    writeTextFile({
      path: `Vagrantfile`,
      contents: content,
    }).then(() => {
      // alert('Your VM is ready to be launched !');
      // setIsNotificationOpen(true);
    }).catch((error) => {
      alert(error);
    });

    const powershellCommand = new Command('vagrant', ['up']);
    powershellCommand.execute()
      .then((output) => {
        setPowershellOutput(output);
      })
  }

  
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">

      <LaunchAlert isOpen={isNotificationOpen} setIsOpen={setIsNotificationOpen} psContent={powershellOutput} />

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
              <div className='flex justify-between'>
                <div className='w-2/3'>
                  <FormField
                    control={form.control}
                    name="boxname"
                    render={({ field}) => (
                      <FormItem>
                        <FormLabel htmlFor="boxname">Vagrant Box name</FormLabel>
                        <FormControl>
                          <Input {...field} defaultValue="" type="text" id="boxname" placeholder="ubuntu/trusty64" />
                        </FormControl>
                        <FormMessage>{form.formState.errors.boxname?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="boxversion"
                    render={({ field}) => (
                      <FormItem>
                        <FormLabel htmlFor="boxversion">Vagrant Box version</FormLabel>
                        <FormControl>
                          <Input {...field} defaultValue="" type="text" id="boxversion" placeholder="1.0.0" />
                        </FormControl>
                        <FormMessage>{form.formState.errors.boxversion?.message}</FormMessage>
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
                    name="vmname"
                    render={({ field}) => (
                      <FormItem>
                        <FormLabel htmlFor="vmname">VM Name</FormLabel>
                        <FormControl>
                          <Input {...field} defaultValue="" type="text" id="vmname" placeholder="My VM" />
                        </FormControl>
                        <FormMessage>{form.formState.errors.vmname?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
                <div className='w-1/2'>
                  <FormField
                    control={form.control}
                    name="hostname"
                    render={({ field}) => (
                      <FormItem>
                        <FormLabel htmlFor="hostname">Hostname</FormLabel>
                        <FormControl>
                          <Input {...field} defaultValue="" type="text" id="hostname" placeholder="SRV-UBUNTU" />
                        </FormControl>
                        <FormMessage>{form.formState.errors.hostname?.message}</FormMessage>
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
