// app.js

const express = require('express');
const cors = require('cors');

const port = process.env.PORT || 3000;
require("dotenv").config({ path: __dirname + "/.env" });

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Allow all origins
app.use(cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

const baseUrl = process.env.PLATFORM_URL;

const axios = require("axios");

app.get('/', (req, res) => {
    res.send('Hello World');
});


app.get('/test', (req, res) => {
    res.send('Testing');
});

app.get('/open/:email/:password/:brokerId/:postype/:instrument/:volume', async (req, res) => {
    try {
        // {
        //     "instrument": "Step_Index",
        //     "volume": 0.1,
        //     "orderSide": "SELL",
        //     "isMobile": false
        //   }

        // {
        //     "instrument": "Step_Index",
        //     "volume": 0.1,
        //     "orderSide": "BUY",
        //     "slPrice": 8228.82907,
        //     "tpPrice": 8234.03453,
        //     "isMobile": true
        //   }

        const { email, password, brokerId, postype, instrument, volume } = req.params;

        let payload = { email, password, brokerId };

        // console.log(req.params);
        // console.log(payload);
        // return res.send("ok");
        const auth_res = await axios.post(`${baseUrl}/mtr-core-edge/login`, payload)
        // tradingAccounts[0].system.uuid
        // tradingAccounts[0].tradingApiToken
        if (auth_res?.status === 200 && auth_res?.data?.tradingAccounts?.length) {

            console.log("auth_res.data.tradingAccounts ::::::::  ", auth_res.data.tradingAccounts[0]);
            const parsedAuthRes = auth_res.data.tradingAccounts.map((e, i) => ({
                token: e?.tradingApiToken || "",
                uuid: e?.offer?.system?.uuid || "",
            }));
            // console.log(parsedAuthRes[0])

            const headers = {
                'Accept': '*/*',
                'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
                "Content-type": "application/json",
                "Auth-Trading-Api": parsedAuthRes[0].token,
                "Referer": `${baseUrl}/dashboard/Step_Index/trade`
            }
            console.log("HEADERS :::::::: ", headers)
            payload = { instrument, "volume": parseFloat(volume), "orderSide": postype.toUpperCase(), isMobile: false };
            console.log("payload ::::::::  ", payload)
            // return res.send("ok")
            const open_res = await axios.post(`${baseUrl}/mtr-api/${parsedAuthRes[0].uuid}/position/open`, payload, { headers });

            console.log(open_res?.data);

            return res.send("ok");

            // if (api_res?.data?.orderId?.length) {
            //     return res.send(api_res.data.orderId);
            // } else {
            //     return res.status(400).send("failed1");
            // }
            // return res.json(resJson)
            // res.json(api_res.data.tradingAccounts)
        } else {
            console.log(api_res);
            return res.status(400).send("failed2");
        }
    } catch (e) {
        console.log(e);
        return res.send(e);
    }
})

app.listen(port, (error) => {
    if (!error)
        console.log("Server is Successfully Running, and App is listening on port " + port)
    else
        console.log("Error occurred, server can't start", error);
}
);