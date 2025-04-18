"use client"

import { ChevronsUp, Award, Share2, ChartNoAxesCombined, BarChart2, Eye, Heart, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";


export default function QuickStates() {
    const [isOpen ,setIsOpen] = useState<boolean>(false)
    return(
        <>
             <div className={`fixed max-w-[540px] -inset-x-6.5 -bottom-1 z-30 transition-transform duration-300 ease-in  px-10 w-full overflow-hidden ${isOpen ? "  ": " translate-y-[650px] "} `}>
                      
                      <div className=" bg-black/40 backdrop-blur-2xl     overflow-hidden  text-white shadow-[0_-1px_0.2px_rgba(0,0,0,0.5),inset_0px_0.7px_0px_rgba(255,255,255,0.10)] rounded-xl rounded-b-none border border-black ">
                          <div className="relative h-[120px] overflow-hidden">
                              {isOpen ?(
                                <div >
                                  <Image src={'./placeholder.svg'} width={40} height={40}  alt={'zak'} className='border-none w-full h-full'/>
                                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                                  <ChevronsUp size={24} strokeWidth={1} onClick={() => setIsOpen(!isOpen)} className={`${isOpen ? 'transform rotate-180' : ''} absolute top-2  right-5 cursor-pointer text-white/60 hover:text-white/80 hover:translate-y-[1.5px]  transition-all duration-300 `}/>                                       

                                  <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end gap-3">
                                              <div className="h-14 w-14 border border-white/40 overflow-hidden rounded-full shadow-lg">
                                              <div className='w-14 h-14 rounded-full object-cover'  />
                                              
                                              </div>
                                              <div className="flex-grow">
                                              <div className="flex items-center gap-1.5">
                                                  <h2 className="text-base font-bold">Zak Gmd</h2>
                                                  <div className="bg-[#fc7348] flex  font-light items-center px-2 py-1 rounded-full text-black border-none text-[10px] h-5">
                                                  <Award className="h-4 w-4 " color='black' strokeWidth={1} /> Top
                                                  </div>
                                              </div>
                                              <p className="text-xs text-gray-300">Design engineer</p>
                                              </div>
                                              <div
                                              
                                              
                                              className="h-8 w-8 rounded-full bg-black/40 text-gray-400 hover:text-orange-400 hover:bg-black/60"
                                              >
                                              <Share2 className="h-4 w-4" />
                                              </div>
                                  </div>
                                  <div className="w-[full] h-[2px]  shadow-[0_0.5px_0.4px_rgba(255,255,255,0.15),inset_0px_1px_0px_rgba(0,0,0,1)] bg-transparent"></div>
                                </div>    
                              ) : (
                               <div className="flex items-center px-5.5 py-3 justify-between ">
                                 <div className="   text-white/80 font-light flex items-center justify-center gap-1 ">
                                      <ChartNoAxesCombined size={20} strokeWidth={1} className="text-white/60" />
                                      
                                      <div className="mt-[2.5px]">Quick stats</div>
                                  </div>
                                   <ChevronsUp size={24} onClick={() => setIsOpen(!isOpen)} strokeWidth={1} className=" cursor-pointer text-white/30 hover:text-white/80 hover:translate-y-[-1.5px] transition-all duration-300 " />                                       
                               </div>
                              )}
                                         
                      
                          </div>
                          <div className="py-6 px-4  ">
                                          <div className=' flex flex-col gap-4'>
                                          <div className="flex flex-col  bg-gradient-to-b from-transparent to-[#fc7348]/5 to-[120%] rounded-lg p-2  shadow-[0_0.5px_0.4px_rgba(255,255,255,0.15),inset_0px_1px_0.4px_rgba(0,0,0,0.95),inset_0.8px_0px_0.4px_rgba(0,0,0,0.75),inset_-0.8px_0px_0.4px_rgba(0,0,0,0.75)]">
                                              <div className='flex items-center justify-between'>
                                              <div className="text-center px-3">
                                              <p className="text-base font-bold text-[#fc7348]/90">248</p>
                                              <p className="text-[12px] text-white/50 font-light">Works</p>
                                              </div>
                                              
                                              <div className="text-center px-3">
                                              <p className="text-base font-bold text-[#fc7348]/90">15.4k</p>
                                              <p className="text-[12px] text-white/50 font-light">Followers</p>
                                              </div>
                                              
                                              <div className="text-center px-3">
                                              <p className="text-base font-bold text-[#fc7348]/90">4.9</p>
                                              <p className="text-[12px] text-white/50 font-light">Rating</p>
                                              </div>
                      
                                              </div>
                                              
                                          </div>
                                          
                                          <div className='flex items-start flex-col gap-2 '>
                                              <div className='flex w-full items-center justify-between'>
                                              <div className='text-xs font-light '>Profile Completion</div>
                                              <div className='text-xs  text-[#fc7348]/90'>58%</div>
                                              </div>
                                              
                                              <div className='w-full relative h-[6px] overflow-hidden rounded-full  shadow-[0_0.5px_0.4px_rgba(255,255,255,0.15),inset_0px_1px_0px_rgba(0,0,0,1)] '>
                                              <div className='absolute inset-0 h-full w-1/2 bg-[#fc7348]/60 rounded-full '></div>
                                              </div>
                                              
                                          </div>
                                          </div>
                                          
                                          <div className="w-full h-[2px] my-6  shadow-[0_0.5px_0.4px_rgba(255,255,255,0.15),inset_0px_1px_0px_rgba(0,0,0,1)] bg-transparent"></div>
                      
                                          <div className='flex flex-col  items-start gap-3 '>
                                              <div className='text-xs font-light '>Analytics</div>
                                              <div className='w-full   mx-auto   rounded-md    grid-cols-3 gap-2 grid'>
                                              <div className='  bg-[#c96542]/90 shadow-[0_1px_0.4px_rgba(0,0,0,0.8),inset_0px_1px_1px_rgba(255,255,255,0.1)] to-[120%] font-light   py-1 text-center rounded-md text-[14px] grid col-span-1  overflow-hidden '>Week</div>
                                              <div className='  py-1 text-center font-light hover:bg-[#fc7348]/40 hover:shadow-[0_1px_0.4px_rgba(0,0,0,0.8),inset_0px_1px_1px_rgba(255,255,255,0.1)] transition-all duration-200 cursor-pointer rounded-md text-[14px] col-span-1 shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.75px_0.65px_rgba(255,255,255,0.10)] '>Month</div>
                                              <div className='  py-1 text-center font-light cursor-pointer rounded-md text-[14px] hover:bg-[#fc7348]/40 col-span-1 shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.75px_0.65px_rgba(255,255,255,0.10)] '>Year</div>
                                          </div>
                                          </div>
                                          <div className="grid grid-cols-3 mt-3 gap-2">
                                              <div className="bg-black/30 border-[0.5px]  border-white/13  p-3 rounded-lg">
                                                  <div className="flex items-center justify-between mb-2">
                                                  <span className="text-xs text-zinc-400">Views</span>
                                                  <span className="text-xs text-emerald-500 flex items-center">
                                                      <span>+130%</span>
                                                  </span>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                  <span className="text-lg font-bold">1.2k</span>
                                                  <div className="h-4 w-10 flex items-end">
                                                      <div className="h-1 bg-emerald-500 w-1 rounded-full"></div>
                                                      <div className="h-2 bg-emerald-500 w-1 rounded-full mx-px"></div>
                                                      <div className="h-3 bg-emerald-500 w-1 rounded-full mx-px"></div>
                                                      <div className="h-4 bg-emerald-500 w-1 rounded-full"></div>
                                                  </div>
                                                  </div>
                                              </div>
                                              
                                              <div className="bg-black/30 border-[0.5px] border-white/13  p-3 rounded-lg">
                                                  <div className="flex items-center justify-between mb-2">
                                                  <span className="text-xs text-zinc-400">Likes</span>
                                                  <span className="text-xs text-emerald-500 flex items-center">
                                                      <span>+30%</span>
                                                  </span>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                  <span className="text-lg font-bold">1.5k</span>
                                                  <div className="h-4 w-10 flex items-end">
                                                      <div className="h-2 bg-emerald-500 w-1 rounded-full"></div>
                                                      <div className="h-1 bg-emerald-500 w-1 rounded-full mx-px"></div>
                                                      <div className="h-3 bg-emerald-500 w-1 rounded-full mx-px"></div>
                                                      <div className="h-2 bg-emerald-500 w-1 rounded-full"></div>
                                                  </div>
                                                  </div>
                                              </div>
                                              
                                              <div className="bg-black/30 border-[0.5px] border-white/13  p-3 rounded-lg">
                                                  <div className="flex items-center justify-between mb-2">
                                                  <span className="text-xs text-zinc-400">Rating</span>
                                                  <span className="text-xs text-emerald-500 flex items-center">
                                                      <span>+30%</span>
                                                  </span>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                  <span className="text-lg font-bold">4.06</span>
                                                  <Star className="h-4 w-4 text-orange-400" />
                                                  </div>
                                              </div>
                                              </div>
                      
                                          <div className='flex flex-col mt-6 items-start  w-full'>
                                              <div className='flex flex-col items-start gap-3   w-full rounded-md   '>
                                              <div className='text-xs font-light'>Performence By work</div>
                                              <div className='flex flex-col items-start gap-2 w-full'>
                                                  <div className='flex border-[0.5px] border-t-0 border-white/4 items-center bg-gradient-to-b px-2 py-2 gap-2  from-transparent to-[#fc7348]/20 to-[320%] rounded-md shadow-[inset_0px_1px_1px_rgba(255,255,255,0.17),0px_1px_0.5px_rgba(0,0,0,0.3)] w-full'>
                                                  <div className='min-w-[40px]  h-[40px] flex items-center justify-center rounded-lg bg-black/60 '>
                                                      <BarChart2 size={18} className="text-zinc-400" />
                                                  </div>
                                                  <div className='w-full flex flex-col  items-start gap-1'>
                                                      <div className='w-full flex items-center justify-between'>
                                                      <div className='text-xs font-medium truncate text-white'>Designing landing page</div>
                                                      <div className='flex items-center pr-2 text-[10px]'>
                                                          <Star className="h-2.5 w-2.5 fill-orange-400 text-orange-400 mr-0.5" />
                                                          4.9
                                                      </div>
                                                      </div>
                                                      <div className='flex items-center text-[10px] gap-2'>
                                                      <div className='flex items-center '>
                                                          <Eye className="h-2.5 w-2.5 mr-0.5" /> 
                                                          <div className=''>423</div>
                                                      </div>
                                                      <div className='flex items-center '>
                                                          <Heart className="h-2.5 w-2.5 mr-0.5" /> 
                                                          <div className=''>423</div>
                                                      </div>
                      
                                                      </div>
                                                  </div>
                                                  </div>
                                                  <div className='flex items-center border-[0.5px] border-t-0 border-white/4 bg-gradient-to-b px-2 py-2 gap-2  from-transparent to-[#fc7348]/20 to-[320%] rounded-md shadow-[inset_0px_1px_1px_rgba(255,255,255,0.17),0px_1px_0.5px_rgba(0,0,0,0.3)] w-full'>
                                                  <div className='min-w-[40px]  h-[40px] flex items-center justify-center rounded-lg bg-black/60 '>
                                                      <BarChart2 size={18} className="text-zinc-400" />
                                                  </div>
                                                  <div className='w-full flex flex-col  items-start gap-1'>
                                                      <div className='w-full flex items-center justify-between'>
                                                      <div className='text-xs font-medium truncate text-white'>Designing landing page</div>
                                                      <div className='flex items-center pr-2 text-[10px]'>
                                                          <Star className="h-2.5 w-2.5 fill-orange-400 text-orange-400 mr-0.5" />
                                                          4.9
                                                      </div>
                                                      </div>
                                                      <div className='flex items-center text-[10px] gap-2'>
                                                      <div className='flex items-center '>
                                                          <Eye className="h-2.5 w-2.5 mr-0.5" /> 
                                                          <div className=''>423</div>
                                                      </div>
                                                      <div className='flex items-center '>
                                                          <Heart className="h-2.5 w-2.5 mr-0.5" /> 
                                                          <div className=''>423</div>
                                                      </div>
                      
                                                      </div>
                                                  </div>
                                                  </div>
                                              </div>
                                              </div>
                                              
                                          </div>
                          </div>
                          <div className="  w-full flex flex-col ">
                                          <div className="w-full h-[2px]  shadow-[0_0.5px_0.4px_rgba(255,255,255,0.15),inset_0px_1px_0px_rgba(0,0,0,1)] bg-transparent"></div>
                                          <div className='flex w-full items-center justify-center  gap-2 px-4 py-3 '>
                                          <div className="btn  text-xs flex items-center justify-center px-3 py-2 h-8 rounded-xl  text-white border-[0.5px] border-black/50 tracking-[-0.12px] transition-all duration-150 cursor-pointer bg-gradient-to-b from-white/10 to-[120%] to-[#fc7348]/5  overflow-hidden  ">
                                                  See Profile
                                                  </div>
                                                  <div className="btn text-xs  h-8 text-white font-medium tracking-[-0.12px]  flex items-center justify-center gap-2  px-4 py-2 border-[0.5px]  rounded-xl  border-black/80 bg-[#fc7348]/80 hover:bg-[#fc7348]/90  cursor-pointer hover:to-[#fc7348]/10 hover:bg-gradient-to-b hover:from-transparent transition-all duration-300   hover:shadow-[0px_0.4px_0px_rgba(0,0,0,0.4),inset_0px_2px_2px_rgba(0,0,0,0.48)] active:shadow-[0px_0.1px_0px_rgba(252,115,72,0.01),inset_0px_5px_0px_rgba(0,0,0,0.80)]  shadow-[0_1px_0.4px_rgba(0,0,0,0.15),inset_0px_0.7px_0px_rgba(255,255,255,0.15)] text-[14px] disabled:opacity-50"
                      
                                                  >
                                                      Complete Profile
                                                  </div>
                                          </div>
                                          
                          </div>
                      </div>
              </div>
        </>
    )
}