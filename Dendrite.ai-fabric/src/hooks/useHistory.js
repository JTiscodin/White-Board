import { useState, useRef } from "react"


export const useHistory = () => {
    const history = useRef([])

    const recoveryStack = useRef([])

    const isKeyDown = useRef(false)

    return [history,recoveryStack, isKeyDown]

}