
export class StorageUtils {

    private storageUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL!;

    public constructor(storageUrl?: string) {
        if(storageUrl) {
            this.storageUrl = storageUrl;
        }
    }

    public from(bucketName: string) {
        return new Bucket(bucketName, this.storageUrl);
    }
}

class Bucket {

    private name: string;
    private storageUrl: string;

    constructor(name: string, storageUrl: string) {
        this.name = name;
        this.storageUrl = storageUrl;
    }

    public getPublicUrl(path: string, download?: boolean): string {
        return (this.storageUrl + "/storage/v1/object/public/" + this.name + "/" + path + (download ? "?download" : ""))
    }
}