// postgres
const {Pool} = require('pg');
const pool = new Pool();

async function main(){
    console.log("this should be first")

    try{
        var name1 = await(pool.query('select $1::text as name', ['foo']));
        console.log(name1.rows[0].name, 'says hello');
    }
    catch(err){
        console.error('oh noes:'+ err)
    }

    console.log("this should be last")

    await main1();
}

async function main1(){
    console.log("this should be a first")

    try{
        var name1 = await(pool.query('select $1::text as name', ['foo']));
        console.log(name1.rows[0].name, 'says hello');
    }
    catch(err){
        console.error('oh noes:'+ err)
    }

    console.log("this should be last")
}

async function loop(){
    while(true){
        await main();
    }
}

loop();