import { ApolloClient,InMemoryCache,ApolloProvider,gql, useQuery, useSubscription, useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// import "./style/windows.css"

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


function Windows(props) {

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
  const [addMessage,{data:dataMessage}]=useMutation(send_message,{
    onCompleted:()=>{
      setText('')
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

useEffect(()=>{
console.log("kontakFrom : ",kontakFrom)
},[kontakFrom])



// console.log(dataPrivate)
  function kirim(e){
      if(e.key=='Enter'){
        if (!text||!userName||!to){
          alert('kosong ito lo')
        }else{
        addMessage({
          variables:{
            to:to,
            from:userName,
            text:text
          }
        })}
      }
  }
  function kirim2(e){
    if (!text||!userName||!to){
      alert('kosong ito lo')
    }else{
        addMessage({
          variables:{
            to:to,
            from:userName,
            text:text
          }
        })
    }
  }

const negative=useNavigate()

useEffect(()=>{
if(props.username.trim().length==0){
  negative("/login",{replace:true})
}
},[props.username])
const logout=()=>{
  negative("/login",{replace:true})
}
  return (
    <div className="windows">
        <div className="listKontak">
          <div className="headerListKontak">
             <h4>{props.username}</h4>

             <div onClick={logout} style={{cursor:"pointer"}}>logout</div>
          </div>

          {loadListChat?<p>loading</p> : kontakFrom.map((v,i)=>{
                return  <div key={v.id} className="lastChat" > 

                <div className="picKontak">
                </div>
                <div className="chatText">
                <h5 onClick={()=>{setShow(true)
                    setTo(v.from==props.username?v.to:v.from)}} style={{marginBottom:'0px',cursor:'pointer',marginTop:i==0 ? '0px' : ''}}>{v.from==props.username?v.to:v.from}</h5>
                  <p onClick={()=>{setShow(true)
                    setTo(v.from==props.username?v.to:v.from)}} style={{margin:'0px',cursor:'pointer'}}>{v.text} </p>
                </div>
        
                </div>
                
              })}
    
        </div>  
        <div className="chat">
          <div className="headerListChat">
             <h4>{to}</h4>
          </div>
            <p> {tunggu ? 'loading' : ''}</p>
            

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
                      marginBottom: i+1==dataPrivateChat.message.length ? "1000px":""
                      }} > {v.text}</p>
                  </div>
            })}
          <div className="sendText">
            <input type="text"/>
          </div>
        </div>
    </div>
  );
}

export default Windows;
