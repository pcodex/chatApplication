const generateMsg = (text,username)=>{
    
    return {
        username : username,
        text:text,
        createdAt:new Date().getTime()
    }
}

const generateLocationMsg = (locationInfo,username) => {

    return {
        username:username,
        url : locationInfo,
        createdAt : new Date().getTime()
    }
}

module.exports = {
    generateMsg,
    generateLocationMsg
}