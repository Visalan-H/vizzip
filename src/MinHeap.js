module.exports = class MinHeap{
    constructor(){
        this.heap = [];
    }

    insert(node){
        this.heap.push(node);
        this.bubbleUp(this.heap.length - 1);
    }
    
    extractMin(){
        if (this.heap.length===0) return null;
        if (this.heap.length===1) return this.heap.pop();

        const min=this.heap[0];
        this.heap[0]=this.heap.pop();
        this.bubbleDown(0);
        return min;
    }

    size() {
        return this.heap.length;
    }

    bubbleUp(index){
        while(index>0){
            const parentIndex=Math.floor((index-1)/2);
            if (this.heap[parentIndex].freq<=this.heap[index].freq) break;
            [this.heap[parentIndex],this.heap[index]]=[this.heap[index],this.heap[parentIndex]];
            index=parentIndex;
        }
    }

    bubbleDown(index){
        while(true){
            let smallest=index;
            const leftChild=2*index+1
            const rightChild=2*index+2

            if(leftChild<this.heap.length && this.heap[leftChild].freq<this.heap[smallest].freq){
                smallest=leftChild
            }
            if(rightChild<this.heap.length && this.heap[rightChild].freq<this.heap[smallest].freq){
                smallest=rightChild
            }
            if(smallest===index) break;
            [this.heap[index],this.heap[smallest]]=[this.heap[smallest],this.heap[index]];
            index=smallest;
        }
    }
}