import { CronJob } from "cron";
import mysqldump from 'mysqldump';
import https from "https";

const init_msg = () => console.log(`
    
██████╗░██████╗░░░░░░░██████╗░░█████╗░░█████╗░██╗░░██╗██╗░░░██╗██████╗░
██╔══██╗██╔══██╗░░░░░░██╔══██╗██╔══██╗██╔══██╗██║░██╔╝██║░░░██║██╔══██╗
██║░░██║██████╦╝█████╗██████╦╝███████║██║░░╚═╝█████═╝░██║░░░██║██████╔╝
██║░░██║██╔══██╗╚════╝██╔══██╗██╔══██║██║░░██╗██╔═██╗░██║░░░██║██╔═══╝░
██████╔╝██████╦╝░░░░░░██████╦╝██║░░██║╚█████╔╝██║░╚██╗╚██████╔╝██║░░░░░
╚═════╝░╚═════╝░░░░░░░╚═════╝░╚═╝░░╚═╝░╚════╝░╚═╝░░╚═╝░╚═════╝░╚═╝░░░░░

                  DATABASE BACKUP SERVICE - by void

Database URL:   ${process.env.DATABASE_URL}
Datatbase:      ${process.env.DATABASE}
Supabase URL:   ${process.env.SUPABASE_URL}
CRON:           ${process.env.CRON_TIME}

`)

// Pull in default cron time from the environment
const job = new CronJob(process.env.CRON_TIME || "0 0 0 0 0", async () => {
    console.log(`Creating database dump: ${new Date().toISOString()}`);

    try {
        const dump = await mysqldump({
            connection: {
                host: process.env.DATABASE_URL || "",
                user: process.env.DATABASE_USER || "",
                password: process.env.DATABASE_PW || "",
                database: process.env.DATABASE || ""
            }
        });

        // Save the database into supabase

        const timestamp = Math.floor(Date.now() / 1000);

        const options = {
            hostname: process.env.SUPABASE_URL,
            path: `/storage/v1/object/${process.env.SUPABASE_BUCKET_NAME}/${process.env.DATABASE}-${timestamp}.sql`,
            method: "POST",
            headers: {
                'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
                'Content-Type': 'application/octet-stream'
            }
        };

        const req = https.request(options, (res) => {
            let data = "";

            res.on("data", (chunk) => {
                data += chunk;
            })

            res.on("end", () => {
                console.log("Upload complete!");
            })
        });

        req.on("error", (error) => {
            console.log("Failed to upload the file.", error);
        });

        req.write(dump.dump.data);
        req.end();
    } catch (err) {
        console.log("Failed to backup the database.", err);
    }
}, null, true, "Australia/Sydney");

init_msg();

