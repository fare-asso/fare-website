
import { NextRequest, NextResponse } from "next/server";

import { updateSession } from '@/helpers/supabase/middleware'

import { createClient } from "./helpers/supabase/server";

export async function middleware(request: NextRequest) {
    const supabase = createClient();
    
    const response = await updateSession(request)

    const {error} = await supabase.auth.getUser();

    if(error) {
        return NextResponse.redirect(new URL('/login', request.url))
    } else {
        return response
    }
}

export const config = {
    matcher: '/dashboard/:path*',
}