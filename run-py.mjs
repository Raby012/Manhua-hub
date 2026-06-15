import { execSync } from 'child_process';
try {
   const res = execSync('python3 test-python.py').toString();
   console.log(res);
} catch(e) {
   console.log(e.message);
}
