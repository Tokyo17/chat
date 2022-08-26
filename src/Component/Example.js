import { ApolloClient,InMemoryCache,ApolloProvider,gql, useQuery, useSubscription, useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import "./style/example.css"


const client=new ApolloClient({
    uri:'https://optimum-corgi-31.hasura.app/v1/graphql',
    cache:new InMemoryCache(),
  })
  
  
  
  const getText=gql`
  query MyQuery {
    message {
      text
      from
    }
  }
  `
  const subGetText=gql`
  subscription MySubscription {
    message(order_by: {id: asc}) {
      to
      text
      from
      id
    }
  }
  `
  
  const private_chat=gql`
  subscription MySubscription($_from1: String = "", $_from2: String = "", $_to1: String = "", $_to2: String = "") {
    message(where: {_or: [{_and: [{from: {_eq: $_from1}}, {to: {_eq: $_to1}}]}, {_and: [{from: {_eq: $_from2}}, {to: {_eq: $_to2}}]}]}, order_by: {id: asc}) {
      text
      from
      to
      read
      id
    }
  }
  
  `
  
  const list_chat=gql`
  subscription MySubscription($_from: String = "", $_to: String = "") {
    message(where: {_or: [{from:{_eq:$_from}}, {to:{_eq:$_to}} ]  
    },
      order_by: {id: desc}) {
      text
      read
      id
      from
      to
    }
  }
  
  `
  const send_message=gql`
  mutation MyMutation($to: String = "", $text: String = "", $from: String = "") {
    insert_message(objects: {to: $to, text: $text, from: $from}) {
      returning {
        from
        to
        text
      }
    }
  }
  `
  
  

const Example=(props)=>{

    //======== PENDEKLARASIAN =========

    const negative=useNavigate()
    var el = document.getElementById("two");
    const [to,setTo]=useState('')
    const [from,setFrom]=useState('')
    const [userName,setUserName]=useState('')
    const [text,setText]=useState('')
    const [show,setShow]=useState(false)
  
  
    const [kontakFrom,setKontakFrom]=useState([])
  
    // const {data:dataz}=useQuery(getText,{
    //   onCompleted:(dataz)=>{
    //     console.log(dataz)
    //   }
    // })

    const [addMessage,{data:dataMessage,loading:sabar}]=useMutation(send_message,{
      onCompleted:()=>{
        
      }
    })
    const {data,loading,error}=useSubscription(subGetText)
    const {data:dataPrivateChat,loading:tunggu}=useSubscription(private_chat,{
      variables:{
        _from1:props.username,
        _from2:to,
        _to1:to,
        _to2:props.username
      },
      onSubscriptionData:({subscriptionData:{data}})=>{
        // console.log(data)
        // console.log("v :",v)
      }
    })
  
    const {data:listChat,loading:loadListChat}=useSubscription(list_chat,{
      variables:{
        _from:props.username,
        _to:props.username
      },
      onSubscriptionData: ({ subscriptionData: { data } }) => {
        let arr=[]
        let unique=[]
        let lastChat=[]
          {data?.message.map((v,i,a)=>{
            arr.push(v.from,v.to)
            unique=arr.filter((v,i,a)=>{
              
              return a.indexOf(v)==i&&v!=props.username})         
          })}
  
  
          data.message.reverse()
  
          unique?.map((v,i)=>{
            // console.log(v)
            lastChat[i]=(data?.message.filter(v=>(v.from==unique[i]&&v.to==props.username) || (v.from==props.username&&v.to==unique[i]) )).pop()
          })         
  
          console.log(data)
          setKontakFrom(lastChat)
      }
    })
  

  
  //============ Handler ============

    function kirim(e){


        if(e.key=='Enter'){
            if (!text||!props.username||!to){
                alert('kosong ito lo')
          }else{
          addMessage({
            variables:{
              to:to,
              from:props.username,
              text:text
            }
          })
            setText("")    
        }
        }
    }
    
    function kirim2(e){
      if (!text||!props.username||!to){
        alert('kosong ito lo')
      }else{
          addMessage({
            variables:{
              to:to,
              from:props.username,
              text:text
            }
          })
          setText("")    
      }
    }

  
  
  //=========== UseEffect ===========


//   useEffect(()=>{
//     console.log("kontakFrom : ",kontakFrom)
//     },[kontakFrom])
    
    //untuk auto scroll bottom saat mengirim pesan
  useEffect(()=>{
    if(sabar){
    el.scrollTop = el.scrollHeight}

},[sabar])

     //untuk auto kembali ke halaman login
  useEffect(()=>{
  if(props.username.trim().length==0){
    negative("/login",{replace:true})
  }
  },[props.username])
  const logout=()=>{
    negative("/login",{replace:true})
  }

    return(
        <div className="example">
            <div className="header">
                <div className="oneHeader">
                    {props.username}
                    <div className="pointer" onClick={logout}>Logout</div></div>
                <div className="twoHeader"> {to ? to : "...."}</div>
            </div>
            <div className="content">
                <div className="one">
                {loadListChat?<p>loading</p> : kontakFrom.map((v,i)=>{
                return  <div key={v.id} className="oneKontak" > 

                <div className="picKontak">
                </div>
                <div className="oneChat">
                <h5 onClick={()=>{setShow(true)
                    setTo(v.from==props.username?v.to:v.from)}} style={{marginBottom:'0px',cursor:'pointer',marginTop:i==0 ? '0px' : ''}}>{v.from==props.username?v.to:v.from}</h5>
                  <p onClick={()=>{setShow(true)
                    setTo(v.from==props.username?v.to:v.from)}} style={{margin:'0px',cursor:'pointer'}}>{v.text.slice(0,20)}... </p>
                </div>

                </div>
                
              })}
    
                </div>
                <div  className="two">
                    <div id="two" className="contentChat">
                        <p> {tunggu ? 'loading' : ''}</p>
                        
                        {/* <div class="spinner-border text-primary" role="status">
  <span class="visually-hidden">Loading...</span>
</div> */}

                        {dataPrivateChat?.message.map((v,i)=>{
                            return <div key={v.id} className="bubbleText"  style={{ 
                            textAlign:v.from == props.username ?  'end' : '',
                            display:v.from == props.username ?  'flex' : '',
                            justifyContent:v.from == props.username ?  'flex-end' : '',
                            margin:"10px 20px",
                            }}>
                                <p style={{ 
                                backgroundColor: v.from == props.username ?  '#D9FDD3' : '#A1C8FF',
                                width:"fit-content",
                                padding:"10px 20px",
                                marginBottom: i+1==dataPrivateChat.message.length ? "40px":""
                                }} > {v.text}</p>
                            </div>
                        })}

                           {sabar?<div   style={{ 
                            textAlign:'end' ,
                            display: 'flex' ,
                            marginTop:"-35px",
                            marginBottom:"40px",
                            justifyContent: 'flex-end',
                            margin:"10px 20px",
                            }}>
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>

                            </div> : ""}
                    </div>

                    
                    <div className="twoSend">
                        <input value={text} onKeyDown={kirim} onChange={e=> setText(e.target.value)} type="text"/>
                        <div onClick={kirim2} className="pointer">
                            Send
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Example