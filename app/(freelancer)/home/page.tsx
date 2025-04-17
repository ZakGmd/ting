import { Bell, Bookmark, BarChart3, ClipboardCheck, FolderHeart, HelpCircle, Home, LogOut, Mail, Search, Settings, User } from "lucide-react";
import { EB_Garamond } from "next/font/google";
import Link from 'next/link';
import { Geist } from "next/font/google";
import QuickStates from "@/components/freelancer/home/quickStates";
import { SearchBar } from "@/components/freelancer/home/searchBar";
import Post from "@/components/freelancer/home/post";
import CreatePostForm from "@/components/freelancer/home/post-form";
import { auth } from "@/auth";
import { Star } from "lucide-react";

const garamond = EB_Garamond({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    display: 'swap',
  });

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['sans-serif'],
  adjustFontFallback: true,
  variable: '--font-geist',
});
const popularSkills = [
    "UI/UX Design",
    "Next.js",
    "React",
    "Tailwind CSS"
  ];

export default async function Page(){
    const session = await auth();
    const user = session?.user;
    
    return(
        <>
          <div className={` flex ${geist.className}  overflow-hidden items-start justify-between text-white max-w-[1400px]  mx-auto `}>
                <div className="min-h-screen relative max-w-[180px] w-full flex flex-col items-start gap-3 ">
                    <div className="px-3 flex items-start">
                        <h1 className={` text-4xl  ${garamond.className} align-text-top font-normal  bg-clip-text leading-relaxed text-transparent bg-gradient-to-r to-slate-100 from-[-10%] from-[#fc7348]`}>Tingle</h1>
                    </div>
                    
                    <nav className="max-h-max relative flex flex-col gap-4   flex-1 h-full  px-2  rounded-r-lg w-full">
                        
                        {/* General & Communications */}
                        <div className="flex flex-col items-start gap-2 w-full">
                            <div className="text-white/50 text-xs px-2.5 cursor-pointer " >General</div>
                            <div className="flex flex-col items-start gap-1.5 w-full">
                            <Link href="/home" className="flex w-full items-center transition-shadow duration-200 shadow-[inset_0px_1px_1px_rgba(0,0,0,0.5),0px_0.5px_0px_rgba(255,255,255,0.17)] gap-2 py-1 px-2.5 bg-gradient-to-b from-transparent to-[#fc7348]/5 hover:bg-gradient-to-b hover:from-transparent hover:to-[#fc7348]/5 overflow-hidden hover:shadow-[0px_1px_2px_rgba(0,0,0,0.25),inset_0px_0.8px_1.4px_rgba(255,255,255,0.10)] rounded-lg text-white">
                                <Home color='#fc7348' strokeWidth={1} className="w-5 h-5" />
                                <div className="font-light text-[14px]">Home</div>
                            </Link>
                            <Link 
                                href="/home/profile" 
                                className="flex items-center w-full gap-2 hover:backdrop-blur-sm max-h-max py-1 px-2.5 hover:bg-gradient-to-b hover:from-transparent hover:to-[#fc7348]/5 overflow-hidden hover:shadow-[0px_1px_2px_rgba(0,0,0,0.25),inset_0px_0.8px_1.4px_rgba(255,255,255,0.10)] transition-shadow duration-200 rounded-lg text-white"
                            >
                                <User strokeWidth={1} className="w-5 h-5" />
                                <div className="font-light text-[14px]">Profile</div>
                            </Link>
                            <Link href="/notifications" className="flex items-center w-full gap-2 py-1 px-2.5 hover:bg-gradient-to-b hover:backdrop-blur-sm max-h-max hover:from-transparent hover:to-[#fc7348]/5 overflow-hidden hover:shadow-[0px_1px_2px_rgba(0,0,0,0.25),inset_0px_0.8px_1.4px_rgba(255,255,255,0.10)] transition-shadow duration-200 rounded-lg text-white">
                            <Bell strokeWidth={1} className="w-5 h-5" />
                                                <div className="font-light text-[14px]">Notifications</div>
                            </Link>
                            <Link href="/messages" className="flex items-center w-full gap-2 py-1 px-2.5 hover:bg-gradient-to-b hover:backdrop-blur-sm max-h-max hover:from-transparent hover:to-[#fc7348]/5 overflow-hidden hover:shadow-[0px_1px_2px_rgba(0,0,0,0.25),inset_0px_0.8px_1.4px_rgba(255,255,255,0.10)] transition-shadow duration-200 rounded-lg text-white">
                                                <Mail strokeWidth={1} className="w-5 h-5" />
                                                <div className="font-light text-[14px]">Messages</div>
                            </Link>
                            <Link href="/bookmarks" className="flex items-center w-full gap-2 py-1 px-2.5 hover:bg-gradient-to-b hover:backdrop-blur-sm max-h-max hover:from-transparent hover:to-[#fc7348]/5 overflow-hidden hover:shadow-[0px_1px_2px_rgba(0,0,0,0.25),inset_0px_0.8px_1.4px_rgba(255,255,255,0.10)] transition-shadow duration-200 rounded-lg text-white">
                                <Bookmark strokeWidth={1} className="w-5 h-5" />
                                <div className="font-light text-[14px]">Bookmarks</div>
                            </Link>
                            </div>
                        
                        </div>
                        
                        {/* Portfolio Section */}
                        <div className="flex flex-col items-start gap-2 w-full">
                            <div className="text-white/50 text-xs px-2.5 ">Portfolio</div>
                            <div className="flex flex-col items-start gap-1.5 w-full">
                                <Link 
                                    href="/portfolio" 
                                    className="flex items-center w-full gap-2 hover:backdrop-blur-sm max-h-max py-1 px-2.5 hover:bg-gradient-to-b hover:from-transparent hover:to-[#fc7348]/5 overflow-hidden hover:shadow-[0px_1px_2px_rgba(0,0,0,0.25),inset_0px_0.8px_1.4px_rgba(255,255,255,0.10)] transition-shadow duration-200 rounded-lg text-white"
                                >
                                    <FolderHeart strokeWidth={1} className="w-5 h-5" />
                                    <div className="font-light text-[14px]">My Work</div>
                                </Link>
                                <Link 
                                    href="/analytics" 
                                    className="flex items-center w-full gap-2 hover:backdrop-blur-sm max-h-max py-1 px-2.5 hover:bg-gradient-to-b hover:from-transparent hover:to-[#fc7348]/5 overflow-hidden hover:shadow-[0px_1px_2px_rgba(0,0,0,0.25),inset_0px_0.8px_1.4px_rgba(255,255,255,0.10)] transition-shadow duration-200 rounded-lg text-white"
                                >
                                    <BarChart3 strokeWidth={1} className="w-5 h-5" />
                                    <div className="font-light text-[14px]">Analytics</div>
                                </Link>
                            </div>
                        
                        </div>
                        
                        {/* Jobs Section */}
                        <div className="flex flex-col items-start gap-2 w-full">
                            <div className="text-white/50 text-xs px-2.5 ">Jobs</div>
                            <Link 
                                href="/jobs/explore" 
                                className="flex items-center w-full gap-2 hover:backdrop-blur-sm max-h-max py-1 px-2.5 hover:bg-gradient-to-b hover:from-transparent hover:to-[#fc7348]/5 overflow-hidden hover:shadow-[0px_1px_2px_rgba(0,0,0,0.25),inset_0px_0.8px_1.4px_rgba(255,255,255,0.10)] transition-shadow duration-200 rounded-lg text-white"
                            >
                                <Search strokeWidth={1} className="w-5 h-5" />
                                <div className="font-light text-[14px]">Explore Jobs</div>
                            </Link>
                            
                            <Link 
                                href="/jobs/applied" 
                                className="flex items-center w-full gap-2 hover:backdrop-blur-sm max-h-max py-1 px-2.5 hover:bg-gradient-to-b hover:from-transparent hover:to-[#fc7348]/5 overflow-hidden hover:shadow-[0px_1px_2px_rgba(0,0,0,0.25),inset_0px_0.8px_1.4px_rgba(255,255,255,0.10)] transition-shadow duration-200 rounded-lg text-white"
                            >
                                <ClipboardCheck strokeWidth={1} className="w-5 h-5" />
                                <div className="font-light text-[14px]">Applied Jobs</div>
                            </Link>
                        </div>
                        
                        {/* Bottom section */}
                        <div className="flex flex-col items-start gap-2 w-full mt-auto">
                           <div className="text-white/50 text-xs px-2.5 ">Account</div>
                            <Link href="/settings" className="flex items-center w-full gap-2 py-1 px-2.5 hover:bg-gradient-to-b hover:backdrop-blur-sm max-h-max hover:from-transparent hover:to-[#fc7348]/5 overflow-hidden hover:shadow-[0px_1px_2px_rgba(0,0,0,0.25),inset_0px_0.8px_1.4px_rgba(255,255,255,0.10)] transition-shadow duration-200 rounded-lg text-white">
                                <Settings strokeWidth={1} className="w-5 h-5" />
                                <div className="font-light text-[14px]">Settings</div>
                            </Link>
                            
                            <Link href="/help" className="flex items-center w-full gap-2 py-1 px-2.5 hover:bg-gradient-to-b hover:backdrop-blur-sm max-h-max hover:from-transparent hover:to-[#fc7348]/5 overflow-hidden hover:shadow-[0px_1px_2px_rgba(0,0,0,0.25),inset_0px_0.8px_1.4px_rgba(255,255,255,0.10)] transition-shadow duration-200 rounded-lg text-white">
                                <HelpCircle strokeWidth={1} className="w-5 h-5" />
                                <div className="font-light text-[14px]">Help</div>
                            </Link>
                            <button  className="w-full cursor-pointer flex items-center gap-2 py-1 px-3 hover:bg-gradient-to-b hover:backdrop-blur-sm max-h-max hover:from-transparent hover:to-[#fc7348]/5 overflow-hidden hover:shadow-[0px_1px_2px_rgba(0,0,0,0.25),inset_0px_0.8px_1.4px_rgba(255,255,255,0.10)] transition-shadow duration-200 rounded-lg text-white">
                                <LogOut strokeWidth={1} className="w-5 h-5" />
                                <div className="font-light text-[14px]">Logout</div>
                            </button>
                        </div>
                    </nav>
                    <QuickStates />
                </div>
                <div className="flex item-start px-10 justify-between  ">
                    <div className="w-[4px] h-[100vh]  shadow-[0px_0.5px_1px_rgba(255,255,255,0.1),inset_-0.4px_0.2px_0px_rgba(0,0,0,0.7),inset_0.4px_0.2px_0px_rgba(0,0,0,0.7)] bg-black/5 "></div>

                    <div className="w-full  flex flex-col gap-0.5  h-screen ">
                        <div className="flex relative   flex-col items-start w-full">
                            <div className="absolute top-0 left-0 right-0 z-20  bg-[#1D1D1F]/10 backdrop-blur-md grid grid-cols-3">
                                <div className=" inline-flex items-center justify-center whitespace-nowrap px-3 text-sm font-medium py-2.5 border-b-2 border-[#fc7348]/90   ">For you</div>
                                <div className="inline-flex items-center justify-center whitespace-nowrap px-3 text-sm font-medium py-2.5 ">Following</div>
                                <div className="inline-flex items-center justify-center whitespace-nowrap px-3 text-sm font-medium py-2.5  ">Projects</div>
                            </div>
                            <div className="w-full absolute   h-[2px] mt-10 z-20  shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.75px_0.65px_rgba(255,255,255,0.10)]"></div>

                        </div>
                        <div className="Feed flex flex-col items-start overflow-y-auto pt-10   w-full ">

                            <div className="flex flex-col items-start w-full">
                              <CreatePostForm user={user} />
                              <div className="w-full h-[2px] shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.3px_0.65px_rgba(255,255,255,0.10)]"></div>
                            </div>
 
                            <div className="flex flex-col items-start w-full mt-4 ">
                                <div className=" px-4.5  flex items-center  justify-between w-full">
                                    <div>Recent Activity</div>
                                    <div>view</div>
                                </div>
                                <Post/>
                                <Post/>
                                <Post/>
                                <Post/>
                            </div>
                        </div>
                        
                    </div>
                    <div className="w-[4px] h-[100vh]  shadow-[0px_0.5px_1px_rgba(255,255,255,0.1),inset_-0.4px_0.2px_0px_rgba(0,0,0,0.7),inset_0.4px_0.2px_0px_rgba(0,0,0,0.7)] bg-black/5 "></div>

                </div>
                
                 <div className="max-w-[320px] w-full">
                    <SearchBar/>
                    
                  
                    <div className="mt-4 flex flex-col gap-2 ">
                    <div className=" flex flex-col w-full items-start gap-2 ">
                        <div className="flex items-center justify-between pr-1 w-full">
                            <div>Recommanded jobs</div>
                            <div className="flex items-center text-[11px] gap-0.5  text-white/50 cursor-pointer hover:text-white/70 transition-all duration-300">View all</div>
                        </div>
                        <div className=" flex flex-col gap-2 w-full">
                            <div className="w-full p-1 border border-white/4 shadow-sm bg-gradient-to-b from-white/1 to-[#fc7348]/4 to-[230%] rounded-lg">
                                <div className="flex flex-col items-start w-full px-2 py-2 border backdrop-blur-sm border-white/8 rounded-lg">
                                    <div className="flex items-start w-full justify-between">
                                    <div className="flex items-start gap-2">
                                        <div className="w-10 h-10 bg-black/40 rounded-lg"></div>
                                        <div className="flex flex-col justify-start items-start">
                                            <div className="text-[14px] text-white/90 leading-normal tracking-[-0.10px]">Zakaria Ghoumidate</div>
                                            <div className="flex items-center gap-0.5">
                                            <Star className="h-3 w-3 fill-orange-400 text-orange-400 " />
                                            <div className="text-[11px] text-white/60">4.2 (1032)</div>
                                            </div>
                                        </div>
                                        </div> 
                                        <Bookmark strokeWidth={1} className="w-5 h-5 text-white/35 hover:text-white/55 transition-all duration-300 cursor-pointer" />
                                    </div>
                                    <div className="flex flex-col items-start gap-2 mt-2 w-full">
                                        <div className="flex flex-col items-start gap-0.5">
                                            <div className="text-[14px] leading-normal tracking-[-0.11px]">React Next.js Landing Pages Development.</div>
                                            <div className="px-1 py-0.5 bg-[#4466ff79]/40 contrast-75 shadow font-light rounded-md text-xs ">Intermediate</div>
                                        </div>
                                    
                                            <div className="w-full gap-1.5 flex ">
                                            {popularSkills.map((skill, idx) => (
                                                <div 
                                                    key={idx}
                                                
                                                    className="px-2 py-1 bg-white/6 flex items-center text-white/55 hover:text-white/75 hover:bg-white/7 transition-all duration-300  rounded-md backdrop-blur-md text-[10px]  "
                                                >
                                                    {skill}
                                                </div>
                                        ))}
                                        </div>
                                    
                                        
                                    </div>
                                </div>
                                <div className="px-1  mt-1 flex items-center justify-between w-full">
                                    <div className="text-xs text-white/40">65 applicants</div>
                                    <div className="flex items-center gap-1">
                                    <div className="rounded-md  px-3 py-0.5 text-[12px] border-[0.5px] border-[#fc7348]/15 text-white/50 hover:text-white/80 transition-all duration-300  cursor-pointer"
                                        >See job</div>
                                        <div className="rounded-md px-3 py-0.5 text-[12px] border-[0.5px] border-[#fc7348]/1 bg-[#fc7348]/25 text-white/50 hover:text-white transition-all duration-300 hover:bg-[#fc7348]/90 cursor-pointer"
                                        >Apply</div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full p-1 border border-white/4 shadow-sm bg-gradient-to-b from-white/1 to-[#fc7348]/4 to-[230%] rounded-lg">
                                <div className="flex flex-col items-start w-full p-2 border border-white/8 rounded-lg">
                                    <div className="flex items-start w-full justify-between">
                                    <div className="flex items-start gap-2">
                                        <div className="w-10 h-10 bg-black/40 rounded-lg"></div>
                                        <div className="flex flex-col justify-start items-start">
                                            <div className="text-[14px] text-white/90 leading-normal tracking-[-0.10px]">Ayman Tahri</div>
                                            <div className="flex items-center gap-0.5">
                                            <Star className="h-3 w-3 fill-orange-400 text-orange-400 " />
                                            <div className="text-[11px] text-white/60">4.8 (3032)</div>
                                            </div>
                                        </div>
                                        </div> 
                                        <Bookmark strokeWidth={1} className="w-5 h-5 text-white/35 hover:text-white/55 transition-all duration-300 cursor-pointer " />
                                    </div>
                                    <div className="flex flex-col items-start gap-2 mt-2 w-full">
                                        <div className="flex flex-col items-start gap-0.5">
                                            <div className="text-[14px] leading-normal tracking-[-0.11px]">React Next.js Landing Pages Development.</div>
                                            <div className="px-1 py-0.5 bg-[#4466ff79]/40 contrast-75 shadow font-light rounded-md text-xs ">Intermediate</div>
                                        </div>
                                    
                                            <div className="w-full gap-1.5 flex ">
                                            {popularSkills.map((skill, idx) => (
                                                <div 
                                                    key={idx}
                                                
                                                    className="px-2 py-1 bg-white/6 flex items-center text-white/55 hover:text-white/75 hover:bg-white/7 transition-all duration-300  rounded-md backdrop-blur-md text-[10px]  "
                                                >
                                                    {skill}
                                                </div>
                                        ))}
                                        </div>
                                    
                                        
                                    </div>
                                </div>
                                <div className="px-1  mt-1 flex items-center justify-between w-full">
                                    <div className="text-xs text-white/40">65 applicants</div>
                                    <div className="flex items-center gap-1">
                                    <div className="rounded-md  px-3 py-0.5 text-[12px] border-[0.5px] border-[#fc7348]/15 text-white/50 hover:text-white/80 transition-all duration-300  cursor-pointer"
                                        >See job</div>
                                        <div className="rounded-md px-3 py-0.5 text-[12px] border-[0.5px] border-[#fc7348]/1 bg-[#fc7348]/25 text-white/50 hover:text-white transition-all duration-300 hover:bg-[#fc7348]/90 cursor-pointer"
                                        >Apply</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                    </div>
                </div>
          </div>
        </>
        
    )
}