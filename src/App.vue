<template>
    <div id="app">
        <router-view/>
    </div>
</template>

<script>
    export default {
      name: 'App'
    }
</script>
<style>
    html, body {
        width: 100%;
        height: 100%;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-size: 14px;
    }
    *{
        margin: 0;
        padding:0;
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    input,textarea {
        -webkit-user-select: auto;
        outline: none;
    }
    img{
        max-width: 100%;
    }
    #app{
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        width: 100%;
        height: 100%;
        overflow: scroll;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        -webkit-overflow-scrolling: touch;
    }
    :link,:visited,:hover{
        text-decoration: none;
    }
    :focus {
        outline: none;
    }
</style>
