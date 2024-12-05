'use client'
import React, {  } from 'react'
import Aside from './Aside'
import DMProfile from './DMProfile'
import DMContextProvider from '@/context/DMContext'

type Props = {
    children: React.ReactNode
}

function DMLayout({ children }: Props) {

    return (
        <DMContextProvider>
            <div className='flex w-full text-neutral-200'>
                <Aside />
                <div className='md:w-[75%] sm:w-[65%] bg-[#013a6fae] flex flex-grow'>
                    <div className="w-[75%] flex-grow overflow-auto">
                        {children}
                    </div>
                    <DMProfile />
                </div>
            </div>
        </DMContextProvider>
    )
}

export default DMLayout