public class Question2 {
    public static void main(String[] args) {
        String input = "character";
        String lps = longestPalindromicSubsequence(input);
        System.out.println("Input: " + input);
        System.out.println("Longest palindromic subsequence: " + lps);
        System.out.println("Length: " + lps.length());
    }

    public static String longestPalindromicSubsequence(String s) {
        if (s ==null||s.isEmpty()) {
            return "";
        }

        int n =s.length();
        int[][] dp =new int[n][n];

        for (int i =0; i < n; i++) {
            dp[i][i] =1;
        }

        for (int len =2; len <=n; len++) {
            for (int i =0; i <=n - len; i++) {
                int j =i+len-1;
                if (s.charAt(i) == s.charAt(j)) {
                    if (len == 2) {
                        dp[i][j] =2;
                    } else {
                        dp[i][j] =dp[i + 1][j - 1] + 2;
                    }
                } else {
                    dp[i][j] =Math.max(dp[i + 1][j], dp[i][j - 1]);
                }
            }
        }

        StringBuilder left =new StringBuilder();
        StringBuilder right =new StringBuilder();
        int i = 0, j =n - 1;

        while (i <= j) {
            if (s.charAt(i) ==s.charAt(j)) {
                if (i == j) {
                    left.append(s.charAt(i));
                } else {
                    left.append(s.charAt(i));
                    right.append(s.charAt(j));
                }
                i++;
                j--;
            } else if (dp[i + 1][j] >=dp[i][j - 1]) {
                i++;
            } else {
                j--;
            }
        }

        return left.toString() + right.reverse().toString();
    }
}
