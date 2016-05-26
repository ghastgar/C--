var assert = require('assert');
var util = require('util');

var Stack = require('./stack');
var Data = require('./data');

var TYPE = require('./utils').TYPE;
var OPERATOR = require('./utils').OPERATOR;
var LITERAL = require('./utils').LITERAL;
var ID = require('./utils').ID;

var funcName2Tree;
var stack = new Stack();

module.exports = {
    load: function(root) {
        assert.notStrictEqual(root, undefined);
        mapFunctions(root);
        assert.notStrictEqual(funcName2Tree.main, undefined, "Main function must exist");
        preProcessAST(root);
        
    },
    run: function() {
        executeFunction("main", null)
    }
};

function mapFunctions(T) {
    assert.strictEqual(T.getType(), "BLOCK-FUNCTIONS");
    funcName2Tree = {};
    var n = T.getChildCount();
    for (var i = 0; i < n; ++i) {
        var subTree = T.getChild(i);
        assert.strictEqual(subTree.getType(), "FUNCTION");
        var funcName = subTree.getChild(1).getChild(0);
        assert.strictEqual(funcName2Tree[funcName], undefined, "Multiple definitions of function " + funcName);
        funcName2Tree[funcName] = subTree;
    }
}

function preProcessAST(T) {
    if (T === null || T === undefined) return;
    if (T.type === undefined) return;
    switch (T.getType()) {
        case LITERAL.INT: T.children[0] = parseInt(T.getChild(0)); break;
        case LITERAL.DOUBLE:    T.children[0] = parseFloat(T.getChild(0)); break;
        case LITERAL.BOOL: T.children[0] = (T.getChild(0) === 'true'); break;
        case 'TYPE-DECL':
            for(var i = 0; i < T.getChild(1).length; ++i) {
                preProcessAST(T.getChild(1)[i]);
            }
            break;
    }
    var n = T.getChildCount();
    for (var i = 0; i < n; ++i) preProcessAST(T.getChild(i));
}

function executeFunction(funcName, args) {
    var func = funcName2Tree[funcName];
    assert.notStrictEqual(func, undefined, "Function "+funcName+" not declared");
    // TODO work with list arguments
    stack.pushActivationRecord(funcName);
    var result = executeListInstructions(func.getChild(2));
    if (result) result = new Data();
    stack.popActivationRecord();
    return result;
}

function executeListInstructions(T) {
    assert.notStrictEqual(T, undefined);
    var result; //Data obj
    var ninstr = T.getChildCount();
    for (var i = 0; i < ninstr; ++i) {
        result = executeInstruction(T.getChild(i));
        if (result !== undefined) return result;
    }
    return null;
}

function executeInstruction(T) {
    assert.notStrictEqual(T, undefined);
    var value;
    switch (T.getType()) {
        case 'TYPE-DECL':
            var type = T.getChild(0);
            var decl = T.getChild(1);
            var declNum = decl.length;
            for (var i = 0; i < declNum; ++i) {
                var atom = decl[i];
                var varName = atom.getChild(0);
                if (atom.getType() === 'ASSIGN') {
                    value = evaluateExpression(atom.getChild(1));
                    // TODO check type and value match right here
                    value = new Data(type, value);
                    stack.defineVariable(varName, value);
                }
                else if (atom.getType() === 'ID') stack.defineVariable(varName, new Data(type, undefined));
            }
            break;
        case 'BLOCK-ASSIGN':
            executeListInstructions(T);
            break;
        case 'ASSIGN':
            var id    = T.getChild(0);
            var data = stack.getVariable(id);
            value = evaluateExpression(T.getChild(1));
            data.setValue(value);
            break;
        case 'COUT':
            var subT = T.getChild(0);
            var ninstr = subT.getChildCount();
            for (var i = 0; i < ninstr; ++i) {
                var expr = subT.getChild(i);
                if (expr === 'endl') process.stdout.write('\n');
                else process.stdout.write(evaluateExpression(subT.getChild(i)).toString());
            }
            break;
        default:
            console.log('Instruction not implemented yet.')
    }
}

function evaluateExpression(T) {
    assert.notStrictEqual(T, undefined);
    var type = T.getType();
    var v1, v2;
    switch(type) {
        case OPERATOR.PLUS:
            v1 = evaluateExpression(T.getChild(0));
            v2 = evaluateExpression(T.getChild(1));
            return v1+v2;
        case OPERATOR.MINUS:
            v1 = evaluateExpression(T.getChild(0));
            v2 = evaluateExpression(T.getChild(1));
            return v1-v2;
        case OPERATOR.MUL:
            v1 = evaluateExpression(T.getChild(0));
            v2 = evaluateExpression(T.getChild(1));
            return v1*v2;
        case OPERATOR.DIV:
            v1 = evaluateExpression(T.getChild(0));
            v2 = evaluateExpression(T.getChild(1));
            return v1/v2;
        case OPERATOR.MOD:
            v1 = evaluateExpression(T.getChild(0));
            v2 = evaluateExpression(T.getChild(1));
            return v1%v2;
        case OPERATOR.GT:
            v1 = evaluateExpression(T.getChild(0));
            v2 = evaluateExpression(T.getChild(1));
            return v1 > v2;
        case OPERATOR.LT:
            v1 = evaluateExpression(T.getChild(0));
            v2 = evaluateExpression(T.getChild(1));
            return v1 < v2;
        case OPERATOR.GTE:
            v1 = evaluateExpression(T.getChild(0));
            v2 = evaluateExpression(T.getChild(1));
            return v1 >= v2;
        case OPERATOR.LTE:
            v1 = evaluateExpression(T.getChild(0));
            v2 = evaluateExpression(T.getChild(1));
            return v1 <= v2;
        case OPERATOR.EQ:
            v1 = evaluateExpression(T.getChild(0));
            v2 = evaluateExpression(T.getChild(1));
            return v1 === v2;
        case OPERATOR.NEQ:
            v1 = evaluateExpression(T.getChild(0));
            v2 = evaluateExpression(T.getChild(1));
            return v1 !== v2;
        case LITERAL.INT:
            v1 = T.getChild(0);
            return v1;
        case LITERAL.DOUBLE:
            v1 = T.getChild(0);
            return v1;
        case LITERAL.STRING:
            v1 = T.getChild(0);
            return v1;
        case LITERAL.BOOL:
            v1 = T.getChild(0);
            return v1;
        case ID:
            v1 = stack.getVariable(T.getChild(0));
            return v1.getValue();
    }
}