
export class StorageUtils {

    private storageUrl: string = process.env.SUPABASE_URL!;

    public static from(bucketName: string) {

    }
}

class Bucket {

    name: string;

    constructor(name: string) {
        this.name = name;
    }

    public static getPublicUrl(path: string): string {
        return ""
    }
}