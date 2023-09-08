import dotenv from "dotenv"; //npm i dotenv to encrypt some crucial facts ps,apikey,etc..
import express from "express";
import axios from 'axios';

//dotenv.config() is a function that loads the variables from the .env file 
//into process.env.
dotenv.config();
const app = express();
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
let data ;
let errorData;
app.set('view engine','ejs');

// process is a global object in Node.js that provides information
// and control over the current Node.js process 
const apiKey = process.env.MY_API_KEY;

// rendering home page when get request
app.get("/",(req,res)=>{
    res.render("home" ,{
        weatherData:data
    })
});

app.get("/:route",(req,res)=>{
    const userRoute = req.params.route;
    if(userRoute === "warn"){
        res.render("warn")
    }else if(userRoute === "about"){
        res.render("about")
    }else if(userRoute === "error"){
        res.render("error",{
            error : errorData
        })
    }else{
        res.status(404).send("Not found")
    }
})

// post request with user data by typing cityName
// re render the home page
app.post("/", async(req,res)=>{
    const cityName = req.body.cityName;
    
  try{
   const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`);
   
      const result = response.data;
        console.log(result.main.temp);
        const image_Url = `https://openweathermap.org/img/wn/${result.weather[0].icon}@2x.png`
         data = {
        city: cityName,
        temp: result.main.temp,
        humid:result.main.humidity,
        windSpeed:result.wind.speed,
        feels:result.main.feels_like,
        pressure : result.main.pressure,
        imageUrl : image_Url
        };
     res.redirect("/");// reback to home page 

  }catch(err){
    // if error occurs , route to /error page , otherwise route to redirect("/")
      if (err.code === 'ETIMEDOUT') {
        errorData = {
            err:'Too many request.You may try after some time. 😿'

        }
        res.redirect("/error");
        
        //res.status(429).send('Too many request.You may try after some time. 😿');
      } else if (err.message === "Request failed with status code 401") {
        errorData= {
           err: "Unauthorize! Sorry,can't access with invalid API key. 😵‍💫"

        }
        res.redirect("/error");
        //res.status(401).send("Unauthorize! Sorry,can't access with invalid API key. 😵‍💫");
      } else if(err.message === "Request failed with status code 404"){
        errorData = {
            err:"OOPS!Invalid City.Please Enter the exact Loation."
        }
         res.redirect("/error")
          //res.status(404).send("OOPS! NOt found request.Invalid City.")
      }else {
        errorData ={
            err:'OOPs! ,Internal Server Error 🥴'
        }
        res.redirect("/error")

        //res.status(500).send('OOPs! ,Internal Server Error 🥴');
      }
     console.log(err.message)
  }
});
const port = process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`Server running on port ${port}`)
})