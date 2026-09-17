from db import get_connection


# ========================================
# RM ASSIGNED CUSTOMERS
# ========================================

def get_assigned_customers(
    relationship_manager_id: int,
):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                c.id,
                c.customer_code,
                c.full_name,
                c.email,
                c.phone,
                c.customer_type,
                c.status
            FROM customers c
            WHERE c.relationship_manager_id = %s
            ORDER BY c.full_name ASC
            """,
            (relationship_manager_id,),
        )

        rows = cursor.fetchall()

        customers = []

        for row in rows:
            customers.append(
                {
                    "customer_id": row[0],
                    "customer_code": row[1],
                    "customer_name": row[2],
                    "email": row[3],
                    "phone": row[4],
                    "customer_type": row[5],
                    "status": row[6],
                }
            )

        return {
            "customers": customers,
            "count": len(customers),
        }

    finally:
        cursor.close()
        connection.close()


# ========================================
# EMI DUE IN NEXT N DAYS
# ========================================

def get_customers_with_upcoming_emi(
    relationship_manager_id: int,
    days: int = 7,
):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        safe_days = max(
            1,
            min(int(days), 30),
        )

        cursor.execute(
            f"""
            SELECT
                c.customer_code,
                c.full_name,
                l.loan_number,
                l.loan_type,
                l.emi_amount,
                l.next_emi_date,
                l.outstanding_amount
            FROM customers c
            INNER JOIN loans l
                ON l.customer_id = c.id
            WHERE c.relationship_manager_id = %s
              AND l.status = 'ACTIVE'
              AND l.next_emi_date IS NOT NULL
              AND l.next_emi_date >= CURRENT_DATE
              AND l.next_emi_date
                    <= CURRENT_DATE + INTERVAL '{safe_days} days'
            ORDER BY l.next_emi_date ASC
            """,
            (relationship_manager_id,),
        )

        rows = cursor.fetchall()

        customers = []

        for row in rows:
            customers.append(
                {
                    "customer_code": row[0],
                    "customer_name": row[1],
                    "loan_number": row[2],
                    "loan_type": row[3],
                    "emi_amount": float(
                        row[4] or 0
                    ),
                    "next_emi_date": (
                        row[5].isoformat()
                        if row[5]
                        else None
                    ),
                    "outstanding_amount": float(
                        row[6] or 0
                    ),
                }
            )

        return {
            "days": safe_days,
            "customers": customers,
            "count": len(customers),
        }

    finally:
        cursor.close()
        connection.close()


# ========================================
# HIGH CREDIT UTILIZATION CUSTOMERS
# ========================================

def get_high_credit_utilization_customers(
    relationship_manager_id: int,
    threshold: float = 80,
):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        safe_threshold = max(
            1,
            min(float(threshold), 100),
        )

        cursor.execute(
            """
            SELECT
                c.customer_code,
                c.full_name,
                COALESCE(
                    SUM(card.credit_limit),
                    0
                ) AS credit_limit,
                COALESCE(
                    SUM(
                        card.credit_limit
                        - card.available_limit
                    ),
                    0
                ) AS credit_used
            FROM customers c
            INNER JOIN cards card
                ON card.customer_id = c.id
            WHERE c.relationship_manager_id = %s
              AND card.status = 'ACTIVE'
            GROUP BY
                c.id,
                c.customer_code,
                c.full_name
            HAVING
                COALESCE(
                    SUM(card.credit_limit),
                    0
                ) > 0
                AND
                (
                    COALESCE(
                        SUM(
                            card.credit_limit
                            - card.available_limit
                        ),
                        0
                    )
                    /
                    SUM(card.credit_limit)
                ) * 100 >= %s
            ORDER BY
                (
                    COALESCE(
                        SUM(
                            card.credit_limit
                            - card.available_limit
                        ),
                        0
                    )
                    /
                    SUM(card.credit_limit)
                ) * 100 DESC
            """,
            (
                relationship_manager_id,
                safe_threshold,
            ),
        )

        rows = cursor.fetchall()

        customers = []

        for row in rows:
            credit_limit = float(
                row[2] or 0
            )

            credit_used = float(
                row[3] or 0
            )

            utilization = (
                round(
                    (
                        credit_used
                        / credit_limit
                    ) * 100,
                    2,
                )
                if credit_limit > 0
                else 0
            )

            customers.append(
                {
                    "customer_code": row[0],
                    "customer_name": row[1],
                    "credit_limit": credit_limit,
                    "credit_used": credit_used,
                    "available_credit": max(
                        credit_limit
                        - credit_used,
                        0,
                    ),
                    "utilization_percentage":
                        utilization,
                }
            )

        return {
            "threshold_percentage":
                safe_threshold,
            "customers": customers,
            "count": len(customers),
        }

    finally:
        cursor.close()
        connection.close()


# ========================================
# CUSTOMERS WITH ACTIVE LOANS
# ========================================

def get_customers_with_active_loans(
    relationship_manager_id: int,
):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                c.customer_code,
                c.full_name,
                l.loan_number,
                l.loan_type,
                l.principal_amount,
                l.outstanding_amount,
                l.interest_rate,
                l.emi_amount,
                l.next_emi_date,
                l.status
            FROM customers c
            INNER JOIN loans l
                ON l.customer_id = c.id
            WHERE c.relationship_manager_id = %s
              AND l.status = 'ACTIVE'
            ORDER BY
                c.full_name ASC,
                l.next_emi_date ASC
            """,
            (relationship_manager_id,),
        )

        rows = cursor.fetchall()

        loans = []

        for row in rows:
            loans.append(
                {
                    "customer_code": row[0],
                    "customer_name": row[1],
                    "loan_number": row[2],
                    "loan_type": row[3],
                    "principal_amount": float(
                        row[4] or 0
                    ),
                    "outstanding_amount": float(
                        row[5] or 0
                    ),
                    "interest_rate": float(
                        row[6] or 0
                    ),
                    "emi_amount": float(
                        row[7] or 0
                    ),
                    "next_emi_date": (
                        row[8].isoformat()
                        if row[8]
                        else None
                    ),
                    "status": row[9],
                }
            )

        return {
            "loans": loans,
            "count": len(loans),
        }

    finally:
        cursor.close()
        connection.close()


# ========================================
# CUSTOMERS WITH PENDING SERVICE REQUESTS
# ========================================

def get_customers_with_pending_requests(
    relationship_manager_id: int,
):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                c.customer_code,
                c.full_name,
                sr.request_number,
                sr.request_type,
                sr.subject,
                sr.priority,
                sr.status,
                sr.created_at
            FROM customers c
            INNER JOIN service_requests sr
                ON sr.customer_id = c.id
            WHERE c.relationship_manager_id = %s
              AND LOWER(sr.status) IN (
                  'pending',
                  'open',
                  'in progress',
                  'in_progress'
              )
            ORDER BY
                CASE
                    WHEN LOWER(sr.priority) = 'high'
                        THEN 1
                    WHEN LOWER(sr.priority) = 'medium'
                        THEN 2
                    ELSE 3
                END,
                sr.created_at ASC
            """,
            (relationship_manager_id,),
        )

        rows = cursor.fetchall()

        requests = []

        for row in rows:
            requests.append(
                {
                    "customer_code": row[0],
                    "customer_name": row[1],
                    "request_number": row[2],
                    "request_type": row[3],
                    "subject": row[4],
                    "priority": row[5],
                    "status": row[6],
                    "created_at": (
                        row[7].isoformat()
                        if row[7]
                        else None
                    ),
                }
            )

        return {
            "requests": requests,
            "count": len(requests),
        }

    finally:
        cursor.close()
        connection.close()


# ========================================
# CUSTOMER 360 SUMMARY FOR RM
# ========================================

def get_rm_customer_summary(
    relationship_manager_id: int,
    customer_code: str,
):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                c.id,
                c.customer_code,
                c.full_name,
                c.email,
                c.phone,
                c.customer_type,
                c.status,
                COUNT(DISTINCT a.id),
                COUNT(DISTINCT card.id),
                COUNT(
                    DISTINCT
                    CASE
                        WHEN l.status = 'ACTIVE'
                        THEN l.id
                    END
                ),
                COUNT(
                    DISTINCT
                    CASE
                        WHEN sr.status IS NOT NULL
                        AND LOWER(sr.status) IN (
                            'pending',
                            'open',
                            'in progress',
                            'in_progress'
                        )
                        THEN sr.id
                    END
                )
            FROM customers c

            LEFT JOIN accounts a
                ON a.customer_id = c.id

            LEFT JOIN cards card
                ON card.customer_id = c.id

            LEFT JOIN loans l
                ON l.customer_id = c.id

            LEFT JOIN service_requests sr
                ON sr.customer_id = c.id

            WHERE c.relationship_manager_id = %s
              AND c.customer_code = %s

            GROUP BY
                c.id,
                c.customer_code,
                c.full_name,
                c.email,
                c.phone,
                c.customer_type,
                c.status
            """,
            (
                relationship_manager_id,
                customer_code,
            ),
        )

        row = cursor.fetchone()

        if not row:
            return {
                "found": False,
                "message": (
                    "Customer not found "
                    "or not assigned to you."
                ),
            }

        return {
            "found": True,
            "customer_id": row[0],
            "customer_code": row[1],
            "customer_name": row[2],
            "email": row[3],
            "phone": row[4],
            "customer_type": row[5],
            "status": row[6],
            "accounts_count": row[7],
            "cards_count": row[8],
            "active_loans_count": row[9],
            "pending_requests_count": row[10],
        }

    finally:
        cursor.close()
        connection.close()