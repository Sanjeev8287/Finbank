from db import get_connection


def get_total_balance(customer_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT COALESCE(SUM(balance), 0)
            FROM accounts
            WHERE customer_id = %s
              AND status = 'ACTIVE'
            """,
            (customer_id,),
        )

        total_balance = cursor.fetchone()[0]

        return {
            "total_balance": float(total_balance or 0),
            "currency": "INR",
        }

    finally:
        cursor.close()
        connection.close()


def get_active_loans(customer_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                loan_number,
                loan_type,
                principal_amount,
                outstanding_amount,
                interest_rate,
                emi_amount,
                next_emi_date,
                tenure_months,
                status
            FROM loans
            WHERE customer_id = %s
              AND status = 'ACTIVE'
            ORDER BY next_emi_date ASC NULLS LAST
            """,
            (customer_id,),
        )

        rows = cursor.fetchall()

        loans = []

        for row in rows:
            loans.append(
                {
                    "loan_number": row[0],
                    "loan_type": row[1],
                    "principal_amount": float(row[2] or 0),
                    "outstanding_amount": float(row[3] or 0),
                    "interest_rate": float(row[4] or 0),
                    "emi_amount": float(row[5] or 0),
                    "next_emi_date": (
                        row[6].isoformat()
                        if row[6]
                        else None
                    ),
                    "tenure_months": row[7],
                    "status": row[8],
                }
            )

        return {
            "active_loans": loans,
            "count": len(loans),
        }

    finally:
        cursor.close()
        connection.close()


def get_next_emi(customer_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                loan_number,
                loan_type,
                emi_amount,
                next_emi_date,
                outstanding_amount
            FROM loans
            WHERE customer_id = %s
              AND status = 'ACTIVE'
              AND next_emi_date IS NOT NULL
            ORDER BY next_emi_date ASC
            LIMIT 1
            """,
            (customer_id,),
        )

        row = cursor.fetchone()

        if not row:
            return {
                "found": False,
                "message": "No upcoming EMI found.",
            }

        return {
            "found": True,
            "loan_number": row[0],
            "loan_type": row[1],
            "emi_amount": float(row[2] or 0),
            "next_emi_date": (
                row[3].isoformat()
                if row[3]
                else None
            ),
            "outstanding_amount": float(row[4] or 0),
        }

    finally:
        cursor.close()
        connection.close()


def get_credit_utilization(customer_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                COALESCE(SUM(credit_limit), 0),
                COALESCE(
                    SUM(
                        credit_limit - available_limit
                    ),
                    0
                )
            FROM cards
            WHERE customer_id = %s
              AND status = 'ACTIVE'
            """,
            (customer_id,),
        )

        row = cursor.fetchone()

        credit_limit = float(row[0] or 0)
        credit_used = float(row[1] or 0)

        utilization = (
            round(
                (credit_used / credit_limit) * 100,
                2,
            )
            if credit_limit > 0
            else 0
        )

        return {
            "credit_limit": credit_limit,
            "credit_used": credit_used,
            "available_credit": max(
                credit_limit - credit_used,
                0,
            ),
            "utilization_percentage": utilization,
        }

    finally:
        cursor.close()
        connection.close()


def get_recent_transactions(
    customer_id: int,
    limit: int = 10,
):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        safe_limit = max(
            1,
            min(int(limit), 20),
        )

        cursor.execute(
            f"""
            SELECT
                transaction_reference,
                transaction_type,
                category,
                description,
                amount,
                transaction_date,
                status
            FROM transactions
            WHERE customer_id = %s
            ORDER BY transaction_date DESC
            LIMIT {safe_limit}
            """,
            (customer_id,),
        )

        rows = cursor.fetchall()

        transactions = []

        for row in rows:
            transactions.append(
                {
                    "reference": row[0],
                    "type": row[1],
                    "category": row[2],
                    "description": row[3],
                    "amount": float(row[4] or 0),
                    "date": (
                        row[5].isoformat()
                        if row[5]
                        else None
                    ),
                    "status": row[6],
                }
            )

        return {
            "transactions": transactions,
            "count": len(transactions),
        }

    finally:
        cursor.close()
        connection.close()


def get_customer_summary(customer_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                id,
                customer_code,
                full_name,
                customer_type,
                status
            FROM customers
            WHERE id = %s
            """,
            (customer_id,),
        )

        row = cursor.fetchone()

        if not row:
            return {
                "found": False,
                "message": "Customer not found.",
            }

        return {
            "found": True,
            "customer_id": row[0],
            "customer_code": row[1],
            "customer_name": row[2],
            "customer_type": row[3],
            "status": row[4],
        }

    finally:
        cursor.close()
        connection.close()