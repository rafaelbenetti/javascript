# Javascript
Project to learn advanced javascript.
* Javascript is Synchronous and Single Threaded.

# Conceptual Aside
Syntax Parsers: A program that reads your code and determines what it does and if it's grammar is valid.
* Your code isn't magic. Someone else wrote a program to translate it for the computer.

# Lexical Environments
Where something sits physically in the code you write.
* 'Lexical' means 'having to do with words or grammar'. A lexical environment exists in programming languages in which WHERE you write something is important.

# Execution Contexts
A wrapper to help manage the code that is running.
* There are logs of lexical environments. Which on is currently running is managed via execution contexts. It can contain things beyond what you've written in your code.
* Every function creates a new execution context.

# Outer Environment
It's the scope of the father or the Global Execution Context.
* To override a function or variable of your father, just write again on your Excution Context.

# Name/Value pair
A name which maps to a unique Value.
* The name may  be defined more than once, but only can have one value in any given context.
* That value may be more name/value pairs.

# Object
A collection of name value pairs.
* The simplest definition when talking about Javascript.

# Global
When we create an empty file in javascript the engine creates a global scope or global execution code. In this scope we have access for two things the 'Global Object' and 'this'.
* The simplest definition when talking about Global in Javascript 'Not inside a function'.

# Hoisting
Setup Memory Space for Variables and Functions.
* You can think that you code is moved physically to the top of your file. But it's not like that.
* It's just a memory space for your variables and functions.

# Single Threaded
One command at a time.
* Under the hood of the browser, maybe not.

# Synchronous
One at a time.
* And in order...

# Invocation
Running a function.
* In Javascript, by using parenthesis ().

# Variable Environment
Where the variables live.
* And how they relate to each other in memory.

# Scope 
Where a variable iss available in your code.
* And if it's truly the same variable, or a new copy.