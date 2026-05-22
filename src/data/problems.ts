import { Problem } from '../types';

export const languageStartingTemplates: Record<string, Record<string, string>> = {
  python: {
    'two-sum': `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your code here
        pass
`,
    'reverse-string': `class Solution:
    def reverseString(self, s: list[str]) -> None:
        """
        Do not return anything, modify s in-place instead.
        """
        # Write your code here
        pass
`,
    'palindrome-number': `class Solution:
    def isPalindrome(self, x: int) -> bool:
        # Write your code here
        pass
`,
    'valid-parentheses': `class Solution:
    def isValid(self, s: str) -> bool:
        # Write your code here
        pass
`,
    'longest-substring': `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Write your code here
        pass
`,
    'container-water': `class Solution:
    def maxArea(self, height: list[int]) -> int:
        # Write your code here
        pass
`,
    'merge-intervals': `class Solution:
    def merge(self, intervals: list[list[int]]) -> list[list[int]]:
        # Write your code here
        pass
`,
    'edit-distance': `class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        # Write your code here
        pass
`,
    'three-sum': `class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        # Write your code here
        pass
`,
    'trapping-rain-water': `class Solution:
    def trap(self, height: list[int]) -> int:
        # Write your code here
        pass
`,
    'climbing-stairs': `class Solution:
    def climbStairs(self, n: int) -> int:
        # Write your code here
        pass
`
  },
  javascript: {
    'two-sum': `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your code here
};
`,
    'reverse-string': `/**
 * @param {string[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
var reverseString = function(s) {
    // Write your code here
};
`,
    'palindrome-number': `/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
    // Write your code here
};
`,
    'valid-parentheses': `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    // Write your code here
};
`,
    'longest-substring': `/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
    // Write your code here
};
`,
    'container-water': `/**
 * @param {number[]} height
 * @return {number}
 */
var maxArea = function(height) {
    // Write your code here
};
`,
    'merge-intervals': `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
var merge = function(intervals) {
    // Write your code here
};
`,
    'edit-distance': `/**
 * @param {string} word1
 * @param {string} word2
 * @return {number}
 */
var minDistance = function(word1, word2) {
    // Write your code here
};
`,
    'three-sum': `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function(nums) {
    // Write your code here
};
`,
    'trapping-rain-water': `/**
 * @param {number[]} height
 * @return {number}
 */
var trap = function(height) {
    // Write your code here
};
`,
    'climbing-stairs': `/**
 * @param {number} n
 * @return {number}
 */
var climbStairs = function(n) {
    // Write your code here
};
`
  },
  cpp: {
    'two-sum': `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
    }
};
`,
    'reverse-string': `class Solution {
public:
    void reverseString(vector<char>& s) {
        // Write your code here
    }
};
`,
    'palindrome-number': `class Solution {
public:
    bool isPalindrome(int x) {
        // Write your code here
    }
};
`,
    'valid-parentheses': `class Solution {
public:
    bool isValid(string s) {
        // Write your code here
    }
};
`,
    'longest-substring': `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Write your code here
    }
};
`,
    'container-water': `class Solution {
public:
    int maxArea(vector<int>& height) {
        // Write your code here
    }
};
`,
    'merge-intervals': `class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        // Write your code here
    }
};
`,
    'edit-distance': `class Solution {
public:
    int minDistance(string word1, string word2) {
        // Write your code here
    }
};
`,
    'three-sum': `class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        // Write your code here
    }
};
`,
    'trapping-rain-water': `class Solution {
public:
    int trap(vector<int>& height) {
        // Write your code here
    }
};
`,
    'climbing-stairs': `class Solution {
public:
    int climbStairs(int n) {
        // Write your code here
    }
};
`
  },
  java: {
    'two-sum': `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
    }
}
`,
    'reverse-string': `class Solution {
    public void reverseString(char[] s) {
        // Write your code here
    }
}
`,
    'palindrome-number': `class Solution {
    public boolean isPalindrome(int x) {
        // Write your code here
    }
}
`,
    'valid-parentheses': `class Solution {
    public boolean isValid(String s) {
        // Write your code here
    }
}
`,
    'longest-substring': `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Write your code here
    }
}
`,
    'container-water': `class Solution {
    public int maxArea(int[] height) {
        // Write your code here
    }
}
`,
    'merge-intervals': `class Solution {
    public List<List<Integer>> merge(int[][] intervals) {
        // Write your code here
    }
}
`,
    'edit-distance': `class Solution {
    public int minDistance(String word1, String word2) {
        // Write your code here
    }
}
`,
    'three-sum': `class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        // Write your code here
    }
}
`,
    'trapping-rain-water': `class Solution {
    public int trap(int[] height) {
        // Write your code here
    }
}
`,
    'climbing-stairs': `class Solution {
    public int climbStairs(int n) {
        // Write your code here
    }
}
`
  }
};

export const problemsList: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Array',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly* one solution**, and you may not use the *same* element twice.

You can return the answer in any order.`,
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    examples: [
      {
        id: 1,
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        id: 2,
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      },
      {
        id: 3,
        input: 'nums = [3,3], target = 6',
        output: '[0,1]'
      }
    ],
    testCases: [
      { id: 1, input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
      { id: 2, input: '[3,2,4]\n6', expectedOutput: '[1,2]' },
      { id: 3, input: '[3,3]\n6', expectedOutput: '[0,1]' }
    ],
    acceptanceRate: '51.3%',
    frequencyProgress: 95
  },
  {
    id: 'reverse-string',
    title: 'Reverse String',
    difficulty: 'Easy',
    category: 'String',
    description: `Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array **in-place** with \`O(1)\` extra memory.`,
    constraints: [
      '1 <= s.length <= 10^5',
      's[i] is a printable ascii character.'
    ],
    examples: [
      {
        id: 1,
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]'
      },
      {
        id: 2,
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]'
      }
    ],
    testCases: [
      { id: 1, input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]' },
      { id: 2, input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]' }
    ],
    acceptanceRate: '77.2%',
    frequencyProgress: 64
  },
  {
    id: 'palindrome-number',
    title: 'Palindrome Number',
    difficulty: 'Easy',
    category: 'Math',
    description: `Given an integer \`x\`, return \`true\` if \`x\` is a palindrome, and \`false\` otherwise.

An integer is a **palindrome** when it reads the same backward as forward. For example, \`121\` is a palindrome while \`123\` is not.`,
    constraints: [
      '-2^31 <= x <= 2^31 - 1'
    ],
    examples: [
      {
        id: 1,
        input: 'x = 121',
        output: 'true',
        explanation: '121 reads as 121 from left to right and from right to left.'
      },
      {
        id: 2,
        input: 'x = -121',
        output: 'false',
        explanation: 'From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.'
      },
      {
        id: 3,
        input: 'x = 10',
        output: 'false',
        explanation: 'Reads 01 from right to left. Therefore it is not a palindrome.'
      }
    ],
    testCases: [
      { id: 1, input: '121', expectedOutput: 'true' },
      { id: 2, input: '-121', expectedOutput: 'false' },
      { id: 3, input: '10', expectedOutput: 'false' }
    ],
    acceptanceRate: '54.2%',
    frequencyProgress: 81
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.'
    ],
    examples: [
      {
        id: 1,
        input: 's = "()"',
        output: 'true'
      },
      {
        id: 2,
        input: 's = "()[]{}"',
        output: 'true'
      },
      {
        id: 3,
        input: 's = "(]"',
        output: 'false'
      }
    ],
    testCases: [
      { id: 1, input: '"()"', expectedOutput: 'true' },
      { id: 2, input: '"()[]{}"', expectedOutput: 'true' },
      { id: 3, input: '"(]"', expectedOutput: 'false' }
    ],
    acceptanceRate: '40.8%',
    frequencyProgress: 88
  },
  {
    id: 'longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'String',
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ],
    examples: [
      {
        id: 1,
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        id: 2,
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      },
      {
        id: 3,
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3. Note that the answer must be a substring, "pwke" is a subsequence and not a substring.'
      }
    ],
    testCases: [
      { id: 1, input: '"abcabcbb"', expectedOutput: '3' },
      { id: 2, input: '"bbbbb"', expectedOutput: '1' },
      { id: 3, input: '"pwwkew"', expectedOutput: '3' }
    ],
    acceptanceRate: '34.3%',
    frequencyProgress: 90
  },
  {
    id: 'container-water',
    title: 'Container With Most Water',
    difficulty: 'Medium',
    category: 'Two Pointers',
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`-th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return *the maximum amount of water a container can store*.

**Notice** that you may not slant the container.`,
    constraints: [
      'n == height.length',
      '2 <= n <= 10^5',
      '0 <= height[i] <= 10^4'
    ],
    examples: [
      {
        id: 1,
        input: 'height = [1,8,6,2,5,4,8,3,7]',
        output: '49',
        explanation: 'The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water (blue section) the container can contain is 49.'
      },
      {
        id: 2,
        input: 'height = [1,1]',
        output: '1'
      }
    ],
    testCases: [
      { id: 1, input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49' },
      { id: 2, input: '[1,1]', expectedOutput: '1' }
    ],
    acceptanceRate: '54.5%',
    frequencyProgress: 76
  },
  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    difficulty: 'Medium',
    category: 'Sorting',
    description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return *an array of the non-overlapping intervals that cover all the intervals in the input*.`,
    constraints: [
      '1 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= start_i <= end_i <= 10^4'
    ],
    examples: [
      {
        id: 1,
        input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
        output: '[[1,6],[8,10],[15,18]]',
        explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].'
      },
      {
        id: 2,
        input: 'intervals = [[1,4],[4,5]]',
        output: '[[1,5]]',
        explanation: 'Intervals [1,4] and [4,5] are considered overlapping.'
      }
    ],
    testCases: [
      { id: 1, input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]' },
      { id: 2, input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]' }
    ],
    acceptanceRate: '46.7%',
    frequencyProgress: 68
  },
  {
    id: 'edit-distance',
    title: 'Edit Distance',
    difficulty: 'Hard',
    category: 'Dynamic Programming',
    description: `Given two strings \`word1\` and \`word2\`, return *the minimum number of operations required to convert \`word1\` to \`word2\`*.

You have the following three operations permitted on a word:
1. Insert a character
2. Delete a character
3. Replace a character`,
    constraints: [
      '0 <= word1.length, word2.length <= 500',
      'word1 and word2 consist of lowercase English letters.'
    ],
    examples: [
      {
        id: 1,
        input: 'word1 = "horse", word2 = "ros"',
        output: '3',
        explanation: `horse -> rorse (replace 'h' with 'r')\nrorse -> rose (remove 'r')\nrose -> ros (remove 'e')`
      },
      {
        id: 2,
        input: 'word1 = "intention", word2 = "execution"',
        output: '5',
        explanation: `intention -> inention (remove 't')\ninention -> enention (replace 'i' with 'e')\nenention -> exention (replace 'n' with 'x')\nexention -> exection (replace 'n' with 'c')\nexection -> execution (insert 'u')`
      }
    ],
    testCases: [
      { id: 1, input: '"horse"\n"ros"', expectedOutput: '3' },
      { id: 2, input: '"intention"\n"execution"', expectedOutput: '5' }
    ],
    acceptanceRate: '52.9%',
    frequencyProgress: 52
  },
  {
    id: 'three-sum',
    title: '3Sum',
    difficulty: 'Medium',
    category: 'Two Pointers',
    description: `Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.`,
    constraints: [
      '3 <= nums.length <= 3000',
      '-10^5 <= nums[i] <= 10^5'
    ],
    examples: [
      {
        id: 1,
        input: 'nums = [-1,0,1,2,-1,-4]',
        output: '[[-1,-1,2],[-1,0,1]]',
        explanation: 'The distinct triplets are [-1,0,1] and [-1,-1,2].'
      },
      {
        id: 2,
        input: 'nums = [0,1,1]',
        output: '[]'
      },
      {
        id: 3,
        input: 'nums = [0,0,0]',
        output: '[[0,0,0]]'
      }
    ],
    testCases: [
      { id: 1, input: '[-1,0,1,2,-1,-4]', expectedOutput: '[[-1,-1,2],[-1,0,1]]' },
      { id: 2, input: '[0,1,1]', expectedOutput: '[]' },
      { id: 3, input: '[0,0,0]', expectedOutput: '[[0,0,0]]' }
    ],
    acceptanceRate: '33.5%',
    frequencyProgress: 88
  },
  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    category: 'Two Pointers',
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5'
    ],
    examples: [
      {
        id: 1,
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        explanation: 'The rain water is trapped between elevation points. Total trapped volume == 6.'
      },
      {
        id: 2,
        input: 'height = [4,2,0,3,2,5]',
        output: '9'
      }
    ],
    testCases: [
      { id: 1, input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6' },
      { id: 2, input: '[4,2,0,3,2,5]', expectedOutput: '9' }
    ],
    acceptanceRate: '59.8%',
    frequencyProgress: 94
  },
  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    category: 'Dynamic Programming',
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    constraints: [
      '1 <= n <= 45'
    ],
    examples: [
      {
        id: 1,
        input: 'n = 2',
        output: '2',
        explanation: 'There are two ways: (1) 1 step + 1 step, (2) 2 steps.'
      },
      {
        id: 2,
        input: 'n = 3',
        output: '3',
        explanation: 'There are three ways: (1) 1 step + 1 step + 1 step, (2) 1 step + 2 steps, (3) 2 steps + 1 step.'
      }
    ],
    testCases: [
      { id: 1, input: '2', expectedOutput: '2' },
      { id: 2, input: '3', expectedOutput: '3' },
      { id: 3, input: '5', expectedOutput: '8' }
    ],
    acceptanceRate: '52.4%',
    frequencyProgress: 82
  }
];

export function getStartingTemplate(language: string, problemId: string): string {
  if (languageStartingTemplates[language]?.[problemId]) {
    return languageStartingTemplates[language][problemId];
  }

  // Generate a beautiful, standard algorithmic starting template dynamically!
  const camelName = problemId
    .split('-')
    .map((word, idx) => idx === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  if (language === 'python') {
    return `class Solution:
    def ${camelName}(self) -> None:
        # Write your code here
        pass
`;
  } else if (language === 'javascript') {
    return `/**
 * @return {any}
 */
var ${camelName} = function() {
    // Write your code here
};
`;
  } else if (language === 'cpp') {
    return `class Solution {
public:
    void ${camelName}() {
        // Write your code here
    }
};
`;
  } else if (language === 'java') {
    return `class Solution {
    public void ${camelName}() {
        // Write your code here
    }
}
`;
  }
  return `// Write your code here`;
}

