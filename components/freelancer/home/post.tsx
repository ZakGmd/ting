import { MoreHorizontal, Heart, MessageCircle, Repeat2, BarChart2, Bookmark, Share } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Post() {

    return(
        <>
            <article  className="flex flex-col w-full ">
        <div className="px-4  w-full flex mt-4 ">
            <div className=" border-[0.5px]   w-full  border-black overflow-hidden rounded-xl bg-black/70">
                <div className="flex flex-col   ">
                    <div className="flex items-start justify-between px-3 py-2 ">
                    <div className="flex items-center gap-3">
                        <Link href={`}`}>
                        <div className="w-10 h-10 bg-black/50">
                            image
                        </div>
                        </Link>
                        <div className="flex flex-col items-start ">
                        <div className="flex items-center gap-1.5">
                            <Link href={`}`} className="font-bold hover:underline cursor-pointer">
                            UserPostName
                            </Link>
                            <div className="px-2.5 py-0.5  leading-normal bg-[#fc7348]/35  font-semibold rounded-full text-xs">Pro</div>
                        </div>
                        <span className="text-gray-500">UserPostName + Date</span>
                    </div>
                    </div>
                    
                    <div  className="rounded-full h-8 w-8 flex justify-end text-gray-500">
                        <MoreHorizontal className="w-4 h-4" />
                    </div>
                    </div>
        
                    <div className="flex flex-col">
                    <Link href={""}>
                        <p className="px-4 pb-3">POST TEXT</p>
                    </Link>
                    
                        <div className=" overflow-hidden  ">
                        <Image
                            src={"/test1.jpg"}
                            width={600}
                            height={400}
                            alt="Post image"
                            className="w-full object-cover max-h-[400px]"
                        />
                        </div>
                    

                    <div className="flex justify-between bg-gradient-to-b from-transparent to-[#fc7348]/10 to-[120%] py-6 px-5 text-gray-500">
                        <button 
                        className={`flex items-center gap-2 `}
                        
                        >
                        <Heart className={`w-4 h-4 `} />
                        <span className="text-xs">50</span>
                        </button>
                        <Link 
                        href={``} 
                        className="flex items-center gap-2 hover:text-blue-500"
                        >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-xs">50</span>
                        </Link>
                        <button className="flex items-center gap-2 hover:text-green-500">
                        <Repeat2 className="w-4 h-4" />
                        <span className="text-xs">10</span>
                        </button>
                    
                        <button className="flex items-center gap-2 hover:text-blue-500">
                        <BarChart2 className="w-4 h-4" />
                        <span className="text-xs">0</span>
                        </button>
                        <div className="flex items-center gap-4">
                        <button className="hover:text-blue-500">
                            <Bookmark className="w-4 h-4" />
                        </button>
                        <button className="hover:text-blue-500">
                            <Share className="w-4 h-4" />
                        </button>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="w-full mt-4 h-[2px] shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.3px_0.65px_rgba(255,255,255,0.10)]"></div>

            </article>
        </>
        
    )
}