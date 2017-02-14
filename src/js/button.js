const button = {
    domElement: '<button id="myButton">Push me</button>',
    onClick: (fn) => {
        document
            .getElementById('myButton')
            .addEventListener(
                "click", 
                () => {
                    fn()
                }
                )
    }
};

export default button;