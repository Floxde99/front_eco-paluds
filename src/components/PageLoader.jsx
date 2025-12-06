import React from 'react'

export default function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-100">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin" />
                </div>
                <p className="text-sm text-slate-600 font-medium">Chargement...</p>
            </div>
        </div>
    )
}
