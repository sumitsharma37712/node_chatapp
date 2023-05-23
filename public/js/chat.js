const socket=io()
//element
const $messageForm = document.querySelector('#messagge-form')
const $messageFormInput=document.querySelector('input')
const $messageFormButton=document.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationmessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll=()=>{
    const $newMessage=$messages.lastElementChild

    const newMessageStyle=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyle.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin


    const visibleHeight=$messages.offsetHeight

    const containerHeight=$messages.scrollHeight

    const scrolloffSet=$messages.scrollTop+visibleHeight

    if(containerHeight- newMessageHeight<= scrolloffSet){
        $messages.scrollTop=$messages.scrollHeight
    }




    // console.log(newMessageStyle)
}


socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createAt:moment(message.createAt).format('h : mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html

})


socket.on('locationMessage',(message)=>{
    console.log(url)
    const html=Mustache.render(locationmessageTemplate,{
        username:message.username,
        url:message.url,
        createAt:moment(message.createAt).format('h : mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()

})




document.querySelector('#message-form').addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    const message=e.target.elements.message.value
    socket.emit('sendmessage',message,(error)=>{
        // console.log('The message was delivered!',message)
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value='';
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('message delivered')
    })

})

document.querySelector('#send-location').addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not support in your browser');
    }

    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position)
        socket.emit('sendlocation',{
            latitude:position.coords.latitude,
            longitute:position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('location Share')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error)
    {
        alert(error)
        location.href='/'
    }

})