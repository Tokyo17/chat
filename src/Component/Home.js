import { ApolloClient,InMemoryCache,ApolloProvider,gql, useQuery, useSubscription, useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import '../App.css'

const client=new ApolloClient({
  uri:'https://optimum-corgi-31.hasura.app/v1/graphql',
  cache:new InMemoryCache(),
})


// subscription MySubscription($_eq: String = "") {
//   message(where: {to: {_eq: $_eq}}) {
//     text
//   }
// }

// subscription MySubscription($_from1:String="",$_from2:String="",$_to1:String="",$_to2:String="") {
//   message(where: {
//     _or: [
//       {_and: [{from:{_eq:$_from1}},{to:{_eq:$_to1}}]},
//        {_and: [{from:{_eq:$_from2}},{to:{_eq:$_to2}}]}
//     ]}) {
//     text
//   }
// }

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


function Home() {

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
      _from1:userName,
      _from2:to,
      _to1:to,
      _to2:userName
    },
    onSubscriptionData:({subscriptionData:{data}})=>{
      // console.log(data)
    }
  })
  const {data:listChat,loading:loadListChat}=useSubscription(list_chat,{
    variables:{
      _from:userName,
      _to:userName
    },
    onSubscriptionData: ({ subscriptionData: { data } }) => {
      // console.log(data)
      let arr=[]
      let unique=[]
      let lastChat=[]
      // data.message.reverse()
        {data?.message.map((v,i,a)=>{
          arr.push(v.from,v.to)
          unique=arr.filter((v,i,a)=>{
            
            return a.indexOf(v)==i&&v!=userName})         
        })}


        data.message.reverse()

        unique?.map((v,i)=>{
          // console.log(v)
          lastChat[i]=(data?.message.filter(v=>(v.from==unique[i]&&v.to==userName) || (v.from==userName&&v.to==unique[i]) )).pop()
        })         

        console.log(data)
        setKontakFrom(lastChat)
    }
  })




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


  return (
    <div>

      <div style={{display:'flex'}}>

        <div className="bingkai" style={{
          position:'relative'
        }}>
        
        <div style={{
          width:'566px',
          height:'100%',
          display:'flex'
        }}>
          <div style={{
            backgroundColor:"pink",
            width:'283px'
        }}>
            {loadListChat?<p>loading</p> : kontakFrom.map((v,i)=>{
              return  <div key={v.id}> 
                <h5 onClick={()=>{setShow(true)
                   setTo(v.from==userName?v.to:v.from)}} style={{marginBottom:'0px',cursor:'pointer',marginTop:i==0 ? '0px' : ''}}>{v.from==userName?v.to:v.from}</h5>
                <p onClick={()=>{setShow(true)
                  setTo(v.from==userName?v.to:v.from)}} style={{margin:'0px',cursor:'pointer'}}>{v.text} </p>
              </div>
              
            })}
          </div>
          <div style={{
             backgroundColor:"salmon",
             width:'283px',
             height:'100%',
             position:'absolute',
             transition:"ease-in-out .6s",
             transform: `translate(${show?"0px":"300px"}, 0px)`
          }}>
                 <button onClick={()=>{setShow(false)}}>back</button>
             <p> {tunggu ? 'loading' : ''}</p>
            

            {dataPrivateChat?.message.map(v=>{
              return <p style={{ textAlign:v.from == userName ?  'end' : ''}} key={v.id} >{v.from != userName ? `${v.from} : ` : ''} {v.text}</p>

             })}
          </div>
        </div>

        </div>

        <div className="bingkai"  >
   
               <p> {tunggu ? 'loading' : ''}</p>
            

          {dataPrivateChat?.message.map(v=>{
              return <p style={{ textAlign:v.from == userName ?  'end' : ''}} key={v.id} >{v.from != userName ? `${v.from} : ` : ''} {v.text}</p>

          })}

        </div>

        <div>
            <h4>{userName ? userName : 'empty...'}</h4>
            <input value={from} onChange={e=> setFrom(e.target.value)} />
            <button onClick={()=>{setUserName(from)
               setTo('') 
               setText('')}}>login</button>
        </div>

      </div>
  


      <span>to</span>
      <input value={to} onChange={e=> setTo(e.target.value)} />
      <br/>
      <span>text</span>
      <input value={text} onKeyDown={kirim} onChange={e=> setText(e.target.value)} />
      <button onClick={kirim2}>Kirim</button>

    </div>
  );
}

export default Home;
