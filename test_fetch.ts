import fetch from 'node-fetch';

async function main() {
  try {
    console.log('Fetching merged_problems.json...');
    const res = await fetch('https://raw.githubusercontent.com/neenza/leetcode-problems/master/merged_problems.json');
    if (!res.ok) {
      throw new Error(`Failed to fetch merged_problems: ${res.statusText}`);
    }
    const data = await res.json() as any;
    
    console.log('Is array:', Array.isArray(data));
    const keys = Object.keys(data);
    console.log('Type of root:', typeof data);
    console.log('Number of top-level keys:', keys.length);
    console.log('First 5 keys:', keys.slice(0, 5));
    
    // Let's print the first entry
    const firstKey = keys[0];
    const firstProblem = data[firstKey];
    console.log(`\nSample Problem under key "${firstKey}":`);
    console.log(JSON.stringify(firstProblem, null, 2).slice(0, 1500));
    
  } catch (err: any) {
    console.error('Error fetching merged_problems:', err.message);
  }
}

main();
