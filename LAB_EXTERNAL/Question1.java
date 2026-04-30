public class Question1 {
    private static class Node {
        int value;
        Node next;

        Node(int value, Node next) {
            this.value =value;
            this.next =next;
        }
    }
    private Node head;
    private int size;
    public Question1() {
        head =null;
        size =0;
    }
    public void insert(int value) {
        head =new Node(value, head);
        size++;
    }
    public int delet() {
        if (isempty()) {
            throw new IllegalStateException("Stack is empty");
        }
        int value = head.value;
        head = head.next;
        size--;
        return value;
    }
    public int top() {
        if (isempty()) {
            throw new IllegalStateException("Stack is empty");
        }
        return head.value;
    }

    public boolean isempty() {
        return head == null;
    }
    public int size() {
        return size;
    }
    public static void main(String[] args) {
        Question1 stack = new Question1();
        stack.insert(10);
        stack.insert(20);
        stack.insert(30);
        stack.delet();
        System.out.println("Top: " + stack.top());
        System.out.println("Size: " + stack.size());

        while (!stack.isempty()) {
            System.out.println("Pop: " + stack.delet());
        }

        System.out.println("Empty: " + stack.isempty());
    }
}

