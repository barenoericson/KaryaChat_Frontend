import { apiClient } from './api.client';

export interface PistonResult {
  stdout: string;
  stderr: string;
  code: number;
  signal: string | null;
}

export interface Language {
  id: string;
  label: string;
  version: string;
  placeholder: string;
  color: string;
}

export const LANGUAGES: Language[] = [
  {
    id: 'python',
    label: 'Python',
    version: '*',
    color: '#3B82F6',
    placeholder: 'print("Hello, CodeMate!")',
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    version: '*',
    color: '#F59E0B',
    placeholder: 'console.log("Hello, CodeMate!");',
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    version: '*',
    color: '#0EA5E9',
    placeholder: 'const greet = (name: string): string => `Hello, ${name}!`;\nconsole.log(greet("CodeMate"));',
  },
  {
    id: 'java',
    label: 'Java',
    version: '*',
    color: '#EF4444',
    placeholder: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeMate!");\n    }\n}',
  },
  {
    id: 'c++',
    label: 'C++',
    version: '*',
    color: '#8B5CF6',
    placeholder: '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, CodeMate!" << endl;\n    return 0;\n}',
  },
  {
    id: 'c',
    label: 'C',
    version: '*',
    color: '#6366F1',
    placeholder: '#include <stdio.h>\nint main() {\n    printf("Hello, CodeMate!\\n");\n    return 0;\n}',
  },
  {
    id: 'go',
    label: 'Go',
    version: '*',
    color: '#06B6D4',
    placeholder: 'package main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello, CodeMate!")\n}',
  },
  {
    id: 'rust',
    label: 'Rust',
    version: '*',
    color: '#F97316',
    placeholder: 'fn main() {\n    println!("Hello, CodeMate!");\n}',
  },
  {
    id: 'ruby',
    label: 'Ruby',
    version: '*',
    color: '#DC2626',
    placeholder: 'puts "Hello, CodeMate!"',
  },
  {
    id: 'php',
    label: 'PHP',
    version: '*',
    color: '#7C3AED',
    placeholder: '<?php\necho "Hello, CodeMate!\\n";',
  },
  {
    id: 'kotlin',
    label: 'Kotlin',
    version: '*',
    color: '#A855F7',
    placeholder: 'fun main() {\n    println("Hello, CodeMate!")\n}',
  },
];

export const CLASS_LANG_TO_PISTON: Record<string, string> = {
  Python: 'python',
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  Java: 'java',
  'C++': 'c++',
  C: 'c',
  Go: 'go',
  Rust: 'rust',
  Ruby: 'ruby',
  PHP: 'php',
  Kotlin: 'kotlin',
  Swift: 'python',
  Other: 'python',
};

export async function runCode(language: Language, code: string): Promise<PistonResult> {
  try {
    const { data } = await apiClient.post<PistonResult>(
      '/ai/execute',
      { language: language.id, code },
      { timeout: 35000 },
    );
    return data;
  } catch (err: any) {
    const msg: string =
      err?.response?.data?.message ??
      err?.message ??
      'Failed to connect to the code runner.';
    throw new Error(msg);
  }
}
