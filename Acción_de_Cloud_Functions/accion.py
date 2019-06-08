#
#
# main() will be run when you invoke this action
#
# @param Cloud Functions actions accept a single parameter, which must be a JSON object.
#
# @return The output of this action, which must be a JSON object.
#
#
import sys
import ibm_db

def main(dict):
    
    #Para usar datos del objeto JSON "dict" usar dict["message"]
    conn=ibm_db.connect("DATABASE=BLUDB;HOSTNAME=dashdb-txn-sbox-yp-dal09-04.services.dal.bluemix.net;PORT=50000;PROTOCOL=TCPIP;UID=tzx97475;PWD=sz6csp4k28+3wrll;", "", "")
    
    if dict["operation"]=="information":
        #Preparando la sentencia SQL
        sql="INSERT INTO INFORMATION VALUES (CURRENT_TIMESTAMP,?);"
        stmt = ibm_db.prepare(conn, sql)
    
        #Vincular explícitamente los parámetros
        ibm_db.bind_param(stmt, 1, dict["message"])
    
        #Ejecución de la sentencia.
        ibm_db.execute(stmt)
        
    elif dict["operation"]=="client_opinion":
        #Preparando la sentencia SQL
        sql="INSERT INTO CLIENT_OPINION VALUES (CURRENT_TIMESTAMP,?,?,?);"
        stmt = ibm_db.prepare(conn, sql)
        
        #Vincular explícitamente los parámetros
        ibm_db.bind_param(stmt, 1, dict["valoration"])
        ibm_db.bind_param(stmt, 2, dict["opinion_1"])
        ibm_db.bind_param(stmt, 3, dict["opinion_2"])
        
        #Ejecución de la sentencia.
        ibm_db.execute(stmt)
        
    
    return { 'message': dict["message"]}
