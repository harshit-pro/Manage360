public class TestFormat {
    public static void main(String[] args) {
        System.out.println(String.format("%04d", 9999));
        System.out.println(String.format("%04d", 10000));
        System.out.println(String.format("%04d", 100000));
    }
}
