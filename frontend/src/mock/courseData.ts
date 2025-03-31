import { Course, Unit, Subunit, CourseContent } from '../types/course';

export const mockCourses: Course[] = [
  {
    title: "Introduction to Machine Learning",
    description: "A comprehensive course covering the fundamentals of machine learning algorithms, techniques, and applications.",
    difficulty_level: "Intermediate",
    estimated_duration: "8 weeks",
    folder: "Introduction_to_Machine_Learning-20230615-120000",
    timestamp: "2023-06-15T12:00:00",
    complete: true,
    in_progress: false
  },
  {
    title: "Advanced React Patterns",
    description: "Learn advanced React patterns and techniques for building scalable and maintainable web applications.",
    difficulty_level: "Advanced",
    estimated_duration: "6 weeks",
    folder: "Advanced_React_Patterns-20230820-140000",
    timestamp: "2023-08-20T14:00:00",
    complete: true,
    in_progress: false
  },
  {
    title: "Blockchain Fundamentals",
    description: "Explore the core concepts and principles behind blockchain technology and cryptocurrencies.",
    difficulty_level: "Beginner",
    estimated_duration: "4 weeks",
    folder: "Blockchain_Fundamentals-20231010-090000",
    timestamp: "2023-10-10T09:00:00",
    complete: false,
    in_progress: true
  },
  {
    title: "Python for Data Science",
    description: "Comprehensive introduction to using Python for data analysis, visualization, and machine learning.",
    difficulty_level: "Beginner",
    estimated_duration: "10 weeks",
    folder: "Python_for_Data_Science-20240101-110000",
    timestamp: "2024-01-01T11:00:00",
    initializing: true,
    complete: false,
    in_progress: true
  }
];

export const getMockUnits = (courseFolder: string): Unit[] => {
  // Simulate units based on course folder
  switch(courseFolder) {
    case "Introduction_to_Machine_Learning-20230615-120000":
      return [
        {
          unit_number: 1,
          unit_title: "Fundamentals of Machine Learning",
          unit_description: "Introduction to basic concepts and terminology in machine learning",
          folder: "unit1-Fundamentals_of_Machine_Learning"
        },
        {
          unit_number: 2,
          unit_title: "Supervised Learning Algorithms",
          unit_description: "Detailed exploration of supervised learning algorithms and their applications",
          folder: "unit2-Supervised_Learning_Algorithms"
        },
        {
          unit_number: 3,
          unit_title: "Unsupervised Learning",
          unit_description: "Understanding clustering, dimensionality reduction, and other unsupervised techniques",
          folder: "unit3-Unsupervised_Learning"
        }
      ];
    default:
      // Return some generic units for other courses
      return [
        {
          unit_number: 1,
          unit_title: "Introduction to the Course",
          unit_description: "Overview of the course content and learning objectives",
          folder: `unit1-Introduction_to_the_Course`
        },
        {
          unit_number: 2,
          unit_title: "Core Concepts",
          unit_description: "Exploration of the fundamental concepts and principles",
          folder: `unit2-Core_Concepts`
        }
      ];
  }
};

export const getMockSubunits = (courseFolder: string, unitFolder: string): Subunit[] => {
  // For Introduction to Machine Learning, Unit 1
  if (courseFolder === "Introduction_to_Machine_Learning-20230615-120000" && 
      unitFolder === "unit1-Fundamentals_of_Machine_Learning") {
    return [
      {
        subunit_number: 1.1,
        subunit_title: "What is Machine Learning?",
        file: "subunit1.1-What_is_Machine_Learning.md",
        learning_objectives: [
          "Define machine learning in your own words",
          "Distinguish between traditional programming and machine learning approaches",
          "Identify real-world applications of machine learning"
        ]
      },
      {
        subunit_number: 1.2,
        subunit_title: "Types of Machine Learning Problems",
        file: "subunit1.2-Types_of_Machine_Learning_Problems.md",
        learning_objectives: [
          "Differentiate between supervised, unsupervised, and reinforcement learning",
          "Identify classification and regression problems",
          "Match business problems to appropriate machine learning approaches"
        ]
      },
      {
        subunit_number: 1.3,
        subunit_title: "The Machine Learning Workflow",
        file: "subunit1.3-The_Machine_Learning_Workflow.md",
        learning_objectives: [
          "Describe the end-to-end machine learning workflow",
          "Explain the importance of data preprocessing",
          "Understand model evaluation and deployment considerations"
        ]
      }
    ];
  }
  
  // Generic subunits for other units/courses
  return [
    {
      subunit_number: 1.1,
      subunit_title: "Introduction and Overview",
      file: "subunit1.1-Introduction_and_Overview.md",
      learning_objectives: [
        "Understand the key topics covered in this unit",
        "Recognize the importance of these concepts in the field",
        "Set up the necessary environment for practical exercises"
      ]
    },
    {
      subunit_number: 1.2,
      subunit_title: "Core Principles",
      file: "subunit1.2-Core_Principles.md",
      learning_objectives: [
        "Identify the foundational principles of the subject",
        "Apply basic concepts to simple examples",
        "Analyze how these principles relate to real-world scenarios"
      ]
    }
  ];
};

export const getMockContent = (courseFolder: string, unitFolder: string, subunitFile: string): CourseContent => {
  // Specific content for the ML course subunit 1.1
  if (courseFolder === "Introduction_to_Machine_Learning-20230615-120000" && 
      unitFolder === "unit1-Fundamentals_of_Machine_Learning" &&
      subunitFile === "subunit1.1-What_is_Machine_Learning.md") {
    return {
      frontmatter: {
        title: "What is Machine Learning?",
        unit: "Fundamentals of Machine Learning",
        unit_number: "1",
        subunit_number: 1.1,
        course: "Introduction to Machine Learning",
        difficulty_level: "Intermediate",
        learning_objectives: [
          "Define machine learning in your own words",
          "Distinguish between traditional programming and machine learning approaches",
          "Identify real-world applications of machine learning"
        ],
        key_topics: ["Machine Learning Definition", "AI vs ML", "Machine Learning Applications"]
      },
      content: `
# What is Machine Learning?

Machine learning is a subset of artificial intelligence that focuses on developing systems that can learn from and make decisions based on data. Unlike traditional programming, where explicit rules are coded, machine learning algorithms build models based on sample data to make predictions or decisions without being explicitly programmed to do so.

## Traditional Programming vs. Machine Learning

### Traditional Programming
In traditional programming:
- Humans define explicit rules (code)
- Data and rules are processed
- Computer produces outputs

This process works well for deterministic problems with clear rules, but struggles with complex problems where rules are difficult to define explicitly.

### Machine Learning Approach
With machine learning:
- Humans provide data and expected outputs
- The algorithm learns patterns from the data
- The resulting model can generate outputs for new inputs

This approach is particularly powerful for problems that involve complex patterns, natural language, image recognition, or any task where defining explicit rules is challenging.

## Mathematical Foundations

Machine learning relies on various mathematical concepts. For example, in linear regression, we try to find a line that best fits the data points, which can be represented as:

$$y = mx + b$$

Where $y$ is the predicted value, $m$ is the slope, $x$ is the input feature, and $b$ is the y-intercept.

For more complex models, we often use the concept of loss functions, such as Mean Squared Error (MSE):

$$MSE = \\frac{1}{n} \\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2$$

Where $y_i$ is the actual value and $\\hat{y}_i$ is the predicted value.

## Code Example: Simple Linear Regression in Python

Here's how you might implement a simple linear regression using Python:

\`\`\`python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression

# Generate sample data
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([2, 4, 5, 4, 6])

# Create and train the model
model = LinearRegression()
model.fit(X, y)

# Make predictions
X_test = np.array([[0], [6]])
y_pred = model.predict(X_test)

# Print results
print(f"Coefficient: {model.coef_[0]:.2f}")
print(f"Intercept: {model.intercept_:.2f}")

# Plot the results
plt.scatter(X, y, color='blue', label='Data points')
plt.plot(np.concatenate([X_test, X]), 
         np.concatenate([y_pred, model.predict(X)]), 
         color='red', label='Regression line')
plt.legend()
plt.show()
\`\`\`

## Real-World Applications

Machine learning has transformed numerous industries:

1. **Healthcare**: Diagnosis prediction, personalized treatment recommendations, medical image analysis
2. **Finance**: Fraud detection, algorithmic trading, credit scoring
3. **Retail**: Recommendation systems, demand forecasting, inventory optimization
4. **Transportation**: Self-driving vehicles, traffic prediction, route optimization
5. **Entertainment**: Content recommendation, automatic captioning, voice recognition

## The Role of Data

At the core of machine learning is data. The quality, quantity, and relevance of data directly impact the performance of machine learning models. Key considerations include:

- **Data collection**: Gathering representative, unbiased data
- **Data preprocessing**: Cleaning, normalizing, and transforming raw data
- **Feature engineering**: Creating meaningful features that help the algorithm learn effectively

In the next subunit, we'll explore different types of machine learning problems and how to approach them.
`
    };
  }
  
  // Example content with LaTeX and code blocks for Python
  if (courseFolder === "Advanced_React_Patterns-20230820-140000" && 
      unitFolder === "unit1-Introduction_to_the_Course" &&
      subunitFile === "subunit1.1-Introduction_and_Overview.md") {
    return {
      frontmatter: {
        title: "Introduction to React Design Patterns",
        unit: "Introduction to the Course",
        unit_number: "1",
        subunit_number: 1.1,
        course: "Advanced React Patterns",
        difficulty_level: "Advanced",
        learning_objectives: [
          "Understand the concept of design patterns in React",
          "Identify common problems solved by design patterns",
          "Recognize when to apply specific patterns"
        ]
      },
      content: `
# Introduction to React Design Patterns

## What are Design Patterns?

Design patterns are reusable solutions to common problems in software design. They represent best practices evolved over time by experienced developers. In React, design patterns help us create maintainable, scalable, and efficient component structures.

## Why Learn React Patterns?

As applications grow in complexity, ad-hoc solutions become harder to maintain. Design patterns provide:

- **Consistency**: Standardized approaches to common problems
- **Communication**: Shared vocabulary among developers
- **Efficiency**: Proven solutions that save development time
- **Scalability**: Structures that support application growth

## Example Pattern: Compound Components

Compound components are a pattern where multiple components work together to form a cohesive unit. The parent component manages the shared state while child components consume it.

### Implementation Example

\`\`\`tsx
// A simple implementation of compound components pattern
import React, { createContext, useState, useContext } from 'react';

// Create a context for the Accordion
const AccordionContext = createContext<{
  expandedIndex: number | null;
  toggleItem: (index: number) => void;
} | null>(null);

// Custom hook to use the Accordion context
const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion');
  }
  return context;
};

// Main Accordion component
export const Accordion = ({ children }: { children: React.ReactNode }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  const toggleItem = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };
  
  return (
    <AccordionContext.Provider value={{ expandedIndex, toggleItem }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
};

// Accordion Item component
export const AccordionItem = ({ 
  index, 
  children 
}: { 
  index: number; 
  children: React.ReactNode 
}) => {
  return <div className="accordion-item">{children}</div>;
};

// Accordion Header component
export const AccordionHeader = ({ 
  index, 
  children 
}: { 
  index: number; 
  children: React.ReactNode 
}) => {
  const { toggleItem, expandedIndex } = useAccordion();
  const isExpanded = expandedIndex === index;
  
  return (
    <button 
      className={\`accordion-header \${isExpanded ? 'expanded' : ''}\`}
      onClick={() => toggleItem(index)}
    >
      {children}
      <span className="accordion-icon">
        {isExpanded ? '▼' : '▶'}
      </span>
    </button>
  );
};

// Accordion Panel component
export const AccordionPanel = ({ 
  index, 
  children 
}: { 
  index: number; 
  children: React.ReactNode 
}) => {
  const { expandedIndex } = useAccordion();
  const isExpanded = expandedIndex === index;
  
  return isExpanded ? (
    <div className="accordion-panel">{children}</div>
  ) : null;
};
\`\`\`

### Usage Example

\`\`\`tsx
// How to use the compound component pattern
import { Accordion, AccordionItem, AccordionHeader, AccordionPanel } from './Accordion';

const App = () => {
  return (
    <Accordion>
      <AccordionItem index={0}>
        <AccordionHeader index={0}>Section 1</AccordionHeader>
        <AccordionPanel index={0}>
          This is the content for section 1.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem index={1}>
        <AccordionHeader index={1}>Section 2</AccordionHeader>
        <AccordionPanel index={1}>
          This is the content for section 2.
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};
\`\`\`

## Mathematical Analogy

Design patterns can be thought of as formulas in mathematics. For example, the compound component pattern follows a composition relationship that can be expressed as:

$$CompoundComponent = ParentComponent(ChildComponent_1, ChildComponent_2, ..., ChildComponent_n)$$

And the state management follows the principle:

$$State_{Shared} = f(State_{Parent})$$

Where the state of each child component is derived from the parent component's state.

## Course Overview

In this course, we'll explore various React design patterns:

1. Compound Components
2. Render Props Pattern
3. Custom Hooks Pattern
4. Higher-Order Components (HOCs)
5. State Reducer Pattern
6. Context Module Functions
7. Controlled vs. Uncontrolled Components
8. Props Collections and Getters

Each pattern will be explained with practical examples and real-world scenarios to help you understand when and how to apply them effectively.

Next, we'll dive into the Compound Components pattern in detail.
`
    };
  }

  // Example content with LaTeX for Blockchain course
  if (courseFolder === "Blockchain_Fundamentals-20231010-090000" && 
      unitFolder === "unit1-Introduction_to_the_Course" &&
      subunitFile === "subunit1.1-Introduction_and_Overview.md") {
    return {
      frontmatter: {
        title: "Introduction to Blockchain Technology",
        unit: "Introduction to the Course",
        unit_number: "1",
        subunit_number: 1.1,
        course: "Blockchain Fundamentals",
        difficulty_level: "Beginner",
        learning_objectives: [
          "Understand the basic concept of blockchain",
          "Identify key components of blockchain technology",
          "Explain how blockchain ensures security and trust"
        ]
      },
      content: `
# Introduction to Blockchain Technology

## What is Blockchain?

Blockchain is a distributed ledger technology that enables secure, transparent, and immutable record-keeping without requiring a central authority. It serves as the foundation for cryptocurrencies like Bitcoin, but its applications extend far beyond digital currencies.

## Core Concepts

### Distributed Ledger

A blockchain is essentially a chain of blocks, each containing a set of transactions. This chain is stored and maintained by a network of computers (nodes) rather than a single central entity. Each node has a complete copy of the blockchain, making the system:

- **Decentralized**: No single point of control or failure
- **Transparent**: All transactions are visible to network participants
- **Resilient**: The network continues to function even if some nodes fail

### Cryptographic Security

Blockchain relies heavily on cryptography to ensure security and integrity. Two key cryptographic concepts are:

1. **Hashing**: Creating fixed-length output (hash) from variable-length input
2. **Digital Signatures**: Proving ownership and authorization of transactions

#### Hashing Example

In blockchain, a hash function like SHA-256 takes an input of any size and produces a fixed-length output. For example:

Input: "Hello, Blockchain!"
Output: \`dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f\`

If we change even one character:

Input: "Hello, blockchain!"
Output: \`52a9316a7b5edd623d8b94080f3e6b4b1c946d7f1be6fcae5591dd8b954e6b7f\`

The completely different output demonstrates the "avalanche effect" of hash functions.

### Consensus Mechanisms

For a decentralized network to agree on the state of the blockchain, consensus mechanisms are used. The two most common are:

1. **Proof of Work (PoW)**: Miners solve complex mathematical puzzles to validate transactions
2. **Proof of Stake (PoS)**: Validators are selected based on the number of coins they "stake"

#### The Mathematics of Proof of Work

In Proof of Work, miners need to find a nonce (number) such that when combined with the block data and hashed, it produces a hash with a specific pattern (usually starting with a certain number of zeros).

Mathematically, miners are solving:

$$\text{Find } x \text{ such that } H(block\_data||x) < target$$

Where $H$ is the hash function, $||$ represents concatenation, and $target$ is a threshold defining the difficulty.

The probability of finding a valid hash is:

$$P(\text{valid hash}) = \frac{target}{2^{256}} \text{ (for SHA-256)}$$

### Blocks and Chains

Each block in a blockchain contains:

1. **Block header**: Metadata including previous block's hash, timestamp, and merkle root
2. **Transactions**: The actual data being stored
3. **Hash pointer**: Links to the previous block, creating the "chain"

This structure can be represented as:

$$Block_n = \{Header_n, Transactions_n, Hash(Block_{n-1})\}$$

The inclusion of the previous block's hash creates a tamper-evident chain, as changing any data in a block would change its hash and break the chain.

## Code Example: Simple Blockchain Implementation

\`\`\`javascript
class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(
      this.previousHash + 
      this.timestamp + 
      JSON.stringify(this.transactions) + 
      this.nonce
    ).toString();
  }

  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join('0');
    
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    
    console.log("Block mined: " + this.hash);
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock() {
    return new Block("01/01/2023", "Genesis Block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    const block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    console.log('Block successfully mined!');
    this.chain.push(block);

    this.pendingTransactions = [
      {
        from: null,
        to: miningRewardAddress,
        amount: this.miningReward
      }
    ];
  }

  createTransaction(transaction) {
    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.from === address) {
          balance -= trans.amount;
        }

        if (trans.to === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }
}
\`\`\`

## Applications Beyond Cryptocurrency

While blockchain is the technology behind Bitcoin and other cryptocurrencies, its potential applications extend to:

1. **Supply Chain Management**: Tracking products from origin to consumer
2. **Healthcare**: Secure sharing of patient records
3. **Voting Systems**: Transparent and tamper-resistant electoral processes
4. **Smart Contracts**: Self-executing contracts with terms written in code
5. **Digital Identity**: User-controlled identity verification

## Conclusion

Blockchain technology represents a paradigm shift in how we record and verify information. By eliminating the need for trusted third parties, blockchain creates new possibilities for transparent, secure, and efficient systems across various industries.

In the next subunit, we'll explore the specific mechanisms of the Bitcoin blockchain and how it implements these blockchain principles.
`
    };
  }
  
  // Generic content for other subunits
  return {
    frontmatter: {
      title: "Generic Subunit",
      unit: "Generic Unit",
      unit_number: "1",
      subunit_number: 1.1,
      course: "Generic Course",
      difficulty_level: "Intermediate",
      learning_objectives: [
        "Understand key concepts",
        "Apply principles to examples",
        "Analyze real-world applications"
      ]
    },
    content: `
# Generic Subunit Content

This is placeholder content for a generic subunit. In a real implementation, this would contain detailed educational content related to the specific subunit topic.

## Section 1

Content for section 1 would go here.

## Section 2

Content for section 2 would go here.

### Subsection 2.1

More detailed content would be included.

## Summary

A summary of the key points covered in this subunit.
`
  };
}; 