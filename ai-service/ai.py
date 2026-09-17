import json
import os

from dotenv import load_dotenv
from openai import OpenAI

from tools import (
    get_total_balance,
    get_active_loans,
    get_next_emi,
    get_credit_utilization,
    get_recent_transactions,
    get_customer_summary,
)

from rm_tools import (
    get_assigned_customers,
    get_customers_with_upcoming_emi,
    get_high_credit_utilization_customers,
    get_customers_with_active_loans,
    get_customers_with_pending_requests,
    get_rm_customer_summary,
)

from rag.documents.rag_service import ask_rag


load_dotenv()


# ========================================
# GROQ CLIENT
# ========================================

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-20b",
)


# ========================================
# CUSTOMER TOOLS
# ========================================

CUSTOMER_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_total_balance",
            "description": (
                "Get the authenticated customer's "
                "total balance across active accounts."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_active_loans",
            "description": (
                "Get all active loans of the "
                "authenticated customer."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_next_emi",
            "description": (
                "Get the authenticated customer's "
                "next upcoming EMI."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_credit_utilization",
            "description": (
                "Calculate the authenticated "
                "customer's credit card utilization."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_recent_transactions",
            "description": (
                "Get the authenticated customer's "
                "recent transactions."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "limit": {
                        "type": "integer",
                        "description": (
                            "Number of transactions "
                            "to return. Maximum 20."
                        ),
                    }
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_customer_summary",
            "description": (
                "Get basic information about the "
                "authenticated customer."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
]


# ========================================
# RM TOOLS
# ========================================

RM_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_assigned_customers",
            "description": (
                "Get customers assigned to the "
                "authenticated relationship manager."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_customers_with_upcoming_emi",
            "description": (
                "Find assigned customers whose "
                "active loan EMI is due within "
                "the requested number of days."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "days": {
                        "type": "integer",
                        "description": (
                            "Number of upcoming days. "
                            "Maximum 30."
                        ),
                    }
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name":
                "get_high_credit_utilization_customers",
            "description": (
                "Find assigned customers whose "
                "credit card utilization is at "
                "or above the requested threshold."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "threshold": {
                        "type": "number",
                        "description": (
                            "Credit utilization "
                            "percentage threshold."
                        ),
                    }
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name":
                "get_customers_with_active_loans",
            "description": (
                "Get active loans belonging to "
                "customers assigned to the "
                "authenticated relationship manager."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name":
                "get_customers_with_pending_requests",
            "description": (
                "Find assigned customers with "
                "pending or open service requests."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_rm_customer_summary",
            "description": (
                "Get a summary of a customer "
                "assigned to the authenticated RM "
                "using the customer code."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_code": {
                        "type": "string",
                        "description": (
                            "FinBank customer code."
                        ),
                    }
                },
                "required": [
                    "customer_code"
                ],
            },
        },
    },
]


# ========================================
# CUSTOMER TOOL EXECUTION
# ========================================

def execute_customer_tool(
    tool_name: str,
    arguments: dict,
    customer_id: int,
):
    print(
        f"Executing customer tool: {tool_name}"
    )

    if tool_name == "get_total_balance":
        return get_total_balance(
            customer_id
        )

    if tool_name == "get_active_loans":
        return get_active_loans(
            customer_id
        )

    if tool_name == "get_next_emi":
        return get_next_emi(
            customer_id
        )

    if tool_name == "get_credit_utilization":
        return get_credit_utilization(
            customer_id
        )

    if tool_name == "get_recent_transactions":

        limit = arguments.get(
            "limit",
            10,
        )

        return get_recent_transactions(
            customer_id,
            limit,
        )

    if tool_name == "get_customer_summary":
        return get_customer_summary(
            customer_id
        )

    return {
        "error": "Unknown customer tool"
    }


# ========================================
# RM TOOL EXECUTION
# ========================================

def execute_rm_tool(
    tool_name: str,
    arguments: dict,
    relationship_manager_id: int,
):
    print(
        f"Executing RM tool: {tool_name}"
    )

    if tool_name == "get_assigned_customers":

        return get_assigned_customers(
            relationship_manager_id
        )

    if tool_name == "get_customers_with_upcoming_emi":

        days = arguments.get(
            "days",
            7,
        )

        return get_customers_with_upcoming_emi(
            relationship_manager_id,
            days,
        )

    if (
        tool_name
        == "get_high_credit_utilization_customers"
    ):

        threshold = arguments.get(
            "threshold",
            80,
        )

        return get_high_credit_utilization_customers(
            relationship_manager_id,
            threshold,
        )

    if tool_name == "get_customers_with_active_loans":

        return get_customers_with_active_loans(
            relationship_manager_id
        )

    if (
        tool_name
        == "get_customers_with_pending_requests"
    ):

        return get_customers_with_pending_requests(
            relationship_manager_id
        )

    if tool_name == "get_rm_customer_summary":

        customer_code = arguments.get(
            "customer_code",
            "",
        )

        return get_rm_customer_summary(
            relationship_manager_id,
            customer_code,
        )

    return {
        "error": "Unknown RM tool"
    }


# ========================================
# CUSTOMER SYSTEM PROMPT
# ========================================

CUSTOMER_SYSTEM_PROMPT = """
You are FinBank's customer banking AI assistant.

FinBank is a demo banking application.

You are assisting the authenticated customer.

DATA SOURCES:

1. Customer financial/account questions:
   Use FinBank customer tools.

2. General FinBank banking policy questions:
   Use the RAG policy knowledge system.

3. If a question needs both customer-specific
   data and general policy information, use
   the appropriate customer tool and RAG.

RULES:

- Never invent financial information.
- For balance questions use the balance tool.
- For loan questions use the loan tool.
- For EMI questions use the EMI tool.
- For credit utilization use the credit tool.
- For transaction questions use the transaction tool.
- For profile questions use the customer summary tool.
- For policy questions use RAG.
- Use only retrieved policy context for policy claims.

Never:
- transfer money
- approve loans
- reject loans
- change credit limits
- change accounts
- modify customer information

Never reveal:
- database credentials
- SQL
- API keys
- internal implementation details
- internal customer IDs
- embeddings
- vector data

Currency is Indian Rupees (₹).

Keep answers clear and concise.

Do not mention internal tool names.
"""


# ========================================
# RM SYSTEM PROMPT
# ========================================

RM_SYSTEM_PROMPT = """
You are FinBank's Relationship Manager AI assistant.

FinBank is a demo banking application.

You are assisting an authenticated
Relationship Manager.

IMPORTANT SECURITY RULE:

You may ONLY access customers assigned
to the authenticated relationship manager.

The backend tools enforce this restriction.

Never attempt to bypass this restriction.

DATA SOURCES:

1. Customer portfolio questions:
   Use assigned-customer RM tools.

2. General FinBank policy questions:
   Use the RAG policy knowledge system.

3. Questions requiring both customer data
   and policy information may use both.

Examples:

"Which customers have EMI due next week?"
→ Use RM customer tools.

"What documents are required for a personal loan?"
→ Use RAG.

"Which of my customers have active loans?"
→ Use RM tools.

"What is the FinBank policy for high
credit utilization?"
→ Use RAG.

RULES:

- Use assigned-customer tools for customer data.
- For upcoming EMI questions, use the EMI tool.
- For high credit utilization questions,
  use the credit utilization tool.
- For active loan questions,
  use the active loan tool.
- For service request questions,
  use the pending request tool.
- For assigned customer lists,
  use the assigned customer tool.
- For a specific customer summary,
  use the customer summary tool.
- For policy questions, use RAG.

Default interpretations:

"EMI due soon" means next 7 days.

"high credit utilization" means 80% or higher.

Never invent customer data.

Never expose:
- database credentials
- SQL
- API keys
- internal implementation details
- internal database IDs
- embeddings
- vector data

Never:
- approve loans
- reject loans
- transfer money
- change credit limits
- modify customer information

You may summarize customer information
returned by the tools.

Currency is Indian Rupees (₹).

Keep answers concise and professional.

Do not mention internal tool names.
"""


# ========================================
# RAG HELPER
# ========================================

def execute_rag(
    question: str,
):
    """
    Retrieve relevant FinBank policy information
    using the RAG pipeline.
    """

    print(
        "Executing RAG policy search"
    )

    try:

        result = ask_rag(
            question=question,
            top_k=3,
        )

        print(
            f"RAG result: {result}"
        )

        return result

    except Exception as error:

        print(
            "RAG execution error:",
            repr(error),
        )

        return (
            "I could not retrieve the relevant "
            "FinBank policy information right now."
        )


# ========================================
# RAG DECISION TOOL
# ========================================

RAG_TOOL = {
    "type": "function",
    "function": {
        "name": "search_finbank_policy",
        "description": (
            "Search FinBank policy documents for "
            "general banking policy information. "
            "Use this for questions about loan "
            "requirements, credit card policy, "
            "account policy, service request policy, "
            "or other general FinBank policies."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "question": {
                    "type": "string",
                    "description": (
                        "The policy question to search "
                        "in FinBank policy documents."
                    ),
                }
            },
            "required": [
                "question"
            ],
        },
    },
}


# ========================================
# GENERIC TOOL-CALL LOOP
# ========================================

def run_ai(
    question: str,
    tools: list,
    system_prompt: str,
    user_role: str,
    customer_id: int = None,
    relationship_manager_id: int = None,
):

    # Add RAG to both Customer and RM AI.
    available_tools = [
        *tools,
        RAG_TOOL,
    ]

    messages = [
        {
            "role": "system",
            "content": system_prompt,
        },
        {
            "role": "user",
            "content": question.strip(),
        },
    ]

    max_rounds = 6

    for round_number in range(max_rounds):

        print(
            f"Groq request - round "
            f"{round_number + 1}"
        )

        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=available_tools,
            tool_choice="auto",
            temperature=0.2,
        )

        assistant_message = (
            response.choices[0].message
        )

        # --------------------------------
        # No tool call
        # --------------------------------

        if not assistant_message.tool_calls:

            return (
                assistant_message.content
                or "I could not generate a response."
            )

        # --------------------------------
        # Preserve assistant tool calls
        # --------------------------------

        assistant_tool_calls = []

        for tool_call in (
            assistant_message.tool_calls
        ):

            assistant_tool_calls.append(
                {
                    "id": tool_call.id,
                    "type": "function",
                    "function": {
                        "name":
                            tool_call.function.name,
                        "arguments":
                            tool_call.function.arguments,
                    },
                }
            )

        messages.append(
            {
                "role": "assistant",
                "content":
                    assistant_message.content
                    or "",
                "tool_calls":
                    assistant_tool_calls,
            }
        )

        # --------------------------------
        # Execute tools
        # --------------------------------

        for tool_call in (
            assistant_message.tool_calls
        ):

            tool_name = (
                tool_call.function.name
            )

            try:

                arguments = json.loads(
                    tool_call.function.arguments
                )

            except Exception:

                arguments = {}

            try:

                # ========================
                # RAG
                # ========================

                if (
                    tool_name
                    == "search_finbank_policy"
                ):

                    policy_question = arguments.get(
                        "question",
                        question,
                    )

                    result = execute_rag(
                        policy_question
                    )

                # ========================
                # CUSTOMER TOOLS
                # ========================

                elif user_role == "CUSTOMER":

                    result = execute_customer_tool(
                        tool_name,
                        arguments,
                        customer_id,
                    )

                # ========================
                # RM TOOLS
                # ========================

                else:

                    result = execute_rm_tool(
                        tool_name,
                        arguments,
                        relationship_manager_id,
                    )

                print(
                    f"Tool result: {result}"
                )

            except Exception as error:

                print(
                    f"Tool execution error "
                    f"for {tool_name}:",
                    repr(error),
                )

                result = {
                    "error": (
                        "Unable to retrieve "
                        "the requested information."
                    )
                }

            # --------------------------------
            # Add tool result
            # --------------------------------

            messages.append(
                {
                    "role": "tool",
                    "tool_call_id":
                        tool_call.id,
                    "content":
                        json.dumps(
                            result,
                            default=str,
                        ),
                }
            )

    return (
        "I could not complete the request "
        "right now. Please try again."
    )


# ========================================
# CUSTOMER AI
# ========================================

def ask_customer_ai(
    question: str,
    customer_id: int,
):

    if not question or not question.strip():

        return "Please enter a question."

    return run_ai(
        question=question,
        tools=CUSTOMER_TOOLS,
        system_prompt=CUSTOMER_SYSTEM_PROMPT,
        user_role="CUSTOMER",
        customer_id=customer_id,
    )


# ========================================
# RM AI
# ========================================

def ask_rm_ai(
    question: str,
    relationship_manager_id: int,
):

    if not question or not question.strip():

        return "Please enter a question."

    return run_ai(
        question=question,
        tools=RM_TOOLS,
        system_prompt=RM_SYSTEM_PROMPT,
        user_role="RM",
        relationship_manager_id=(
            relationship_manager_id
        ),
    )


# ========================================
# BACKWARD COMPATIBILITY
# ========================================

def ask_ai(
    question: str,
    customer_id: int,
):

    return ask_customer_ai(
        question,
        customer_id,
    )