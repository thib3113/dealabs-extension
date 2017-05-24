class EventEmitter{  
    constructor() {
        this.listeners = new Map();
        this.uniqListeners = {};
    }
    
    on(label, callback) {
        this.listeners.has(label) || this.listeners.set(label, []);
        var args = this.uniqListenersFired(label)
        if(args)
            callback(...args);
        else
            this.listeners.get(label).push(callback);
    }

    off(label, callback) {  
        let isFunction = function(obj) {  
            return typeof obj == 'function' || false;
        };
        
        let listeners = this.listeners.get(label),
            index;

        if (listeners && listeners.length) {
            index = listeners.reduce((i, listener, index) => {
                return (isFunction(listener) && listener === callback) ?
                    i = index :
                    i;
            }, -1);

            if (index > -1) {
                listeners.splice(index, 1);
                this.listeners.set(label, listeners);
                return true;
            }
        }
        return false;
    }

    uniqListenersFired(label){
        if(this.uniqListeners[label] != undefined && this.uniqListeners[label].fired !== false)
            return this.uniqListeners[label].args;

        return false; 
    }

    registerUniqEvent(label){
        this.uniqListeners[label] = {fired:false};
    }

    emit(label, ...args) {
        if(this.uniqListeners[label] != undefined){
            this.uniqListeners[label] = {
                fired:true,
                args:args
            };
        }
        
        let listeners = this.listeners.get(label);
        if (listeners && listeners.length) {
            listeners.forEach((listener) => {
                listener(...args); 
            });
            return true;
        }
        return false;
    }
}