'use client';

import React, { ChangeEventHandler, useState } from 'react';
import { File, Upload } from 'lucide-react';

export default function FileInput({id, name, accept}: {id?: string, name?: string, accept?: string}) {

  const [filename, setFilename] = useState<string | undefined>(undefined);
  

  const handleChangeFile: ChangeEventHandler<HTMLInputElement> = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(event.target.files && event.target.files.length > 0) {
      setFilename(event.target.files[0].name);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            {
              filename ? (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <File className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="text-sm text-gray-500">{filename}</p>
                </div>
              ) :
              (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="text-sm text-gray-500">
                    Cliquez ou glissez un fichier ici
                    </p>
                </div>
              )
            }
            
          <input
            id={id}
            type="file"
            className="hidden"
            onChange={handleChangeFile}
            name={name}
            accept={accept}
          />
        </label>
      </div>
    </div>
  );
};