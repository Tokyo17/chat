import { useEffect, useState } from "react"
import "./style/login.css"
import bubble1 from "./assets/bubble1.png"
import bubble2 from "./assets/bubble2.png"
import bubble4 from "./assets/bubble4.png"
import bubble7 from "./assets/bubble7.png"
import { useNavigate } from "react-router-dom"
import { useLazyQuery } from "@apollo/client"
import { ApolloClient,InMemoryCache,ApolloProvider,gql, useQuery, useSubscription, useMutation } from "@apollo/client";
import Swal from 'sweetalert2'

const check_login =gql`
query MyQuery($_eq: String = "") {
    kontak(where: {userName: {_eq: $_eq}}) {
      userName
      id
    }
  }  
  `


function Login(props) {

    const negative=useNavigate()

    const [checkLogin,{data:dataLogin}]=useLazyQuery(check_login,{
        onCompleted:(dataLogin)=>{
            console.log(dataLogin.kontak,dataLogin.kontak.length)
            if(dataLogin?.kontak?.length>0){
                negative("/example",{replace:true})
            }else{
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Username Not Found!',
                })
            }
        }
    })


    const home=()=>{

        if(props.username.trim().length!=0){
        // 
        checkLogin({
            variables:{
                _eq:props.username
            }
          })
        }else{
            alert("masih kosong tuh")
        }

        // console.log(props.username.trim().length)
    }


    

 return(
     <div className="containerLogin">
     <div className="bingkaiLogin">
         <img className="bubble1 bubbleimg" src={bubble1}/>
         <img className="bubble2 bubbleimg" src={bubble2}/>
         <img className="bubble4 bubbleimg" src={bubble4}/>
         <img className="bubble7 bubbleimg" src={bubble7}/>
        <div className="titleLogin">
            <h1>Login!</h1>
            <p>Please login first</p>
        </div>
        <input onChange={props.handleUsername} value={props.username} type="text" placeholder="Username"/>
        <br/>
        <input  type="password" placeholder="Password"/>
        <br/>
        {/* <div className="btnLogin" onClick={home}>login</div> */}
        <div onClick={home} className="btnLogin">Login</div>
     </div>
     </div>
 )   
}

export default Login