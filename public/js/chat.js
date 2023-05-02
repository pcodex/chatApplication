const socket = io()


//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')


//templates
const msgtemplate = document.querySelector('#message-template').innerHTML
const urltemplate = document.querySelector('#url-template').innerHTML
const sidebartemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room} = Qs.parse(location.search, {ignoreQueryPrefix:true})

const autoScroll = () => {
    
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of message container
    const containerHeight = $messages.scrollHeight

    //how far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    //if we are at the bottom
    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('serverMsg', (servmsg) => {

    console.log("Message from " + servmsg.username + ": "+ servmsg.text + ' '+ servmsg.createdAt)    
    
    const html = Mustache.render(msgtemplate, {
        chatusername : servmsg.username,
        chatmessage:servmsg.text,
        createdAt:moment(servmsg.createdAt).format('MMM D YYYY hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    //document.querySelector('#Broadcast').innerHTML += '<br>'+ servmsg

    autoScroll()

})

socket.on('locationMessage', (locMsg) => {

    console.log('URL is ',locMsg)
    const maphtml = Mustache.render(urltemplate, {
        username:locMsg.username,
        mapsurl:locMsg.url,
        createdAt : moment(locMsg.createdAt).format('MMM D YYYY hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',maphtml)

    autoScroll()

})


socket.on('roomData', ({room,users}) => {

    const html = Mustache.render(sidebartemplate, {
        room:room,
        users:users
    })


    document.querySelector('#sidebar').innerHTML = html

})

$messageForm.addEventListener('submit', (e) => {

        e.preventDefault() //prevent full page refresh

        //disable the form after submission
        $messageFormButton.setAttribute('disabled','disabled')
        
        const mymsg = e.target.elements.messageinput.value //use the name of the form element 'messageinput'
        e.target.elements.messageinput.value = ''
        
        socket.emit('sendMessage', mymsg, (srvmsg) => {
            $messageFormButton.removeAttribute('disabled')
            $messageFormInput.focus()

            if(srvmsg){
                return console.log('Server error',srvmsg)
            }

            console.log('delivered to server')
        })       

    })

const btnSendLoc = document.querySelector('#sendlocationbtn')
btnSendLoc.addEventListener('click', ()=> {

    if(!navigator.geolocation){
        return console.log('Your browser does not support geolocation')
    }

    btnSendLoc.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        
        const geoinfo = {
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        }

        socket.emit('sendLocation', geoinfo, (srvmsg)=> {
            console.log('Location shared with server ', srvmsg)
            btnSendLoc.removeAttribute('disabled')
        })
    })

    
})

socket.emit('join', {username, room}, (error) => {

    if(error)
    {
        alert(error)
        location.href = '/'
    }

})