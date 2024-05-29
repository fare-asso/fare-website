"use client"

import { Input } from "../input"
import searchLocationAction from "./searchLocationAction";

export default function LocationPicker() {

    return(
        <div>
            <Input type="search" id="locationSearch" name="location" defaultValue="Bretagne" onChange={searchLocationAction}/>
            <div id="map"></div>
        </div>
    )
}