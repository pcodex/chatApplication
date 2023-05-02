const users = []

const addUser = ({id,username,room}) => {

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username || !room)
    {
        return {
            error : 'Username and room are required'
        }
    }

    const existingUser = users.find((user)=> {

        return (user.username === username && user.room===room)

    })

    if(existingUser){
        return {
            error : 'User exists'
        }
    }

    //store user
    const user = {id,username,room}
    users.push(user) 
    return {user}

}

const removeUser = (id) => {

    const index = users.findIndex((user) => {

            return (id === user.id)
    })

    if(index !== -1)
    {
        //splice returns an array of all items removed
        return users.splice(index,1)[0]
    }


}

const getUser = (id) => {

    const usr = users.find( (user) => {
        return (user.id === id)
    })

return usr
}

const getUsersInRoom = (room) => {

    const allusers = users.filter((user) => {

        room = room.trim().toLowerCase()
        
        return (user.room==room)

    })
    return allusers
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}