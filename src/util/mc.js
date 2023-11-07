import * as minio from "minio";
import env from "react-dotenv";

const mc = new minio.Client(
    {
        // endPoint: env.S3_API,
        // useSSL: env.USE_SSL,
        // port: env.S3_API_PORT,
        // accessKey: accessKey,
        // secretKey: secretKey

        endPoint: "play.min.io",
        port: 9000,
        useSSL: true,
        // accessKey: "spotlightUser",
        // secretKey: "spotlightUser123"
        accessKey: "Q3AM3UQ867SPQQA43P2F",
        secretKey: "zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG"
    },

    //Assume role example::
    //https://github.com/minio/minio/blob/master/docs/sts/assume-role.md#testing-an-example-with-assume-rolego 
);

export default mc