/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 David Padgett/Summit Street, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


var __TestPilot = {

	FRAMEWORK_PREFIX: "__TestPilot",
	NAMESPACE_PREFIX: "$",
	NAMESPACE: this,
	ALIASED_FUNCTIONS: [],
	UNIT_TESTS: [],
	UNIT_TEST: null,
	SUMMARY: null,

	AnnotationTypes: {

		TestPilotAnnotation: function TestPilotAnnotation() {
		},

		AfterAnnotation: function After(description) {
			this.description = description;
		},

		AfterClassAnnotation: function AfterClass(description) {
			this.description = description;
		},

		BeforeAnnotation: function Before(description) {
			this.description = description;
		},

		BeforeClassAnnotation: function BeforeClass(description) {
			this.description = description;
		},

		IgnoreAnnotation: function Ignore(description) {
			this.description = description;
		},

		TestAnnotation: function Test(description) {
			this.description = description;
		},

		UnitTestAnnotation: function UnitTest(description) {
			this.description = description;
		}

	},

	Operation: function(unitTestName, unitTestDescription, operationName, category, description) {
		this.unitTestName = unitTestName;
		this.unitTestDescription = unitTestDescription;
		this.operationName = operationName;
		this.category = category;
		this.description = description;
	},

	Result: function(operation) {
		var frameworkState = __TestPilot.getFrameworkState(operation);
		this.unitTestName = frameworkState.unitTestName;
		this.unitTestDescription = frameworkState.unitTestDescription;
		this.operationName = frameworkState.operationName;
		this.category = frameworkState.category;
		this.description = frameworkState.description;
		this.assertions = [];
		this.assumptions = [];
		this.messages = [];
		this.passed = true;
	},

	Summary: function() {

		var members = [__TestPilot.AnnotationTypes.UnitTestAnnotation.name, __TestPilot.AnnotationTypes.BeforeAnnotation.name, __TestPilot.AnnotationTypes.BeforeClassAnnotation.name, __TestPilot.AnnotationTypes.AfterAnnotation.name, __TestPilot.AnnotationTypes.AfterClassAnnotation.name, __TestPilot.AnnotationTypes.TestAnnotation.name, __TestPilot.AnnotationTypes.IgnoreAnnotation.name, __TestPilot.Assertions.assert.name, __TestPilot.Assumptions.assume.name, __TestPilot.message.name];
		for (var i = 0; i < members.length; ++i) {
			this[members[i]] = new __TestPilot.SummaryValue(0, 0, 0);
		};

		this.getUnitTestSummary = function() {
			return (this[members[0]]);
		};

		this.getBeforeSummary = function() {
			return (this[members[1]]);
		};

		this.getBeforeClassSummary = function() {
			return (this[members[2]]);
		};

		this.getAfterSummary = function() {
			return (this[members[3]]);
		};

		this.getAfterClassSummary = function() {
			return (this[members[4]]);
		};

		this.getTestSummary = function() {
			return (this[members[5]]);
		};

		this.getIgnoreSummary = function() {
			return (this[members[6]]);
		};

		this.getAssertionSummary = function() {
			return (this[members[7]]);
		};

		this.getAssumptionSummary = function() {
			return (this[members[8]]);
		};

		this.getMessageSummary = function() {
			return (this[members[9]]);
		};

	},

	SummaryValue: function(total, passed, failed) {
		this.total = total;
		this.passed = passed;
		this.failed = failed;

		this.update = function(successful) {
			this.total++;
			this.passed += successful == true ? 1 : 0;
			this.failed += successful == false ? 1 : 0;
		};
	},

	Assertions: {

		assert: function Assert(assertion, description) {
			__TestPilot.getCurrentResult().assertions.push(assertion);
			__TestPilot.updateSummary(__TestPilot.Assertions.assert.name, assertion.result);
			assertion.type = assertion.constructor.name;
			assertion.description = description;
			assertion.isFatalError = function() {
				return (true);
			};
			if (assertion.result == false) {
				var error = new Error(assertion.type + ": " + (assertion.description != null ? assertion.description : ""));
				error.cause = assertion;
				throw error;
			}
			return (assertion);
		},

		assertArrayEquals: function AssertArrayEquals(expr1, expr2, description) {
			var fn = function AssertArrayEquals(value1, value2) {
				this.result = expr1.constructor == Array && expr2.constructor == Array && expr1.length == expr2.length;
				for (var i = 0; this.result && i < expr1.length; ++i) {
					this.result = expr1[i] == expr2[i];
				}
			};
			return (__TestPilot.Assertions.assert(new fn(expr1, expr2), description));
		},

		assertEquals: function AssertEquals(expr1, expr2, description) {
			var fn = function AssertEquals(value1, value2) {
				this.result = value1 == value2;
			};
			return (__TestPilot.Assertions.assert(new fn(expr1, expr2), description));
		},

		assertFalse: function AssertFalse(expr, description) {
			var fn = function AssertFalse(value) {
				this.result = value == false;
			};
			return (__TestPilot.Assertions.assert(new fn(expr), description));
		},

		assertNotEquals: function AssertNotEquals(expr1, expr2, description) {
			var fn = function AssertNotEquals(value1, value2) {
				this.result = value1 != value2;
			};
			return (__TestPilot.Assertions.assert(new fn(expr1, expr2), description));
		},

		assertNotNull: function AssertNotNull(expr, description) {
			var fn = function AssertNotNull(value) {
				this.result = value != null;
			};
			return (__TestPilot.Assertions.assert(new fn(expr), description));
		},

		assertNotSame: function AssertNotSame(expr1, expr2, description) {
			var fn = function AssertNotSame(value1, value2) {
				this.result = value1 !== value2;
			};
			return (__TestPilot.Assertions.assert(new fn(expr1, expr2), description));
		},

		assertNull: function AssertNull(expr, description) {
			var fn = function AssertNull(value) {
				this.result = value == null;
			};
			return (__TestPilot.Assertions.assert(new fn(expr), description));
		},

		assertSame: function AssertSame(expr1, expr2, description) {
			var fn = function AssertSame(value1, value2) {
				this.result = value1 === value2;
			};
			return (__TestPilot.Assertions.assert(new fn(expr1, expr2), description));
		},

		assertTrue: function AssertTrue(expr, description) {
			var fn = function AssertTrue(value) {
				this.result = expr == true;
			};
			return (__TestPilot.Assertions.assert(new fn(expr), description));
		},

		fail: function Fail(message) {
			var fn = function Fail() {
				this.result = false;
			};
			return (__TestPilot.Assertions.assert(new fn(), message));
		}

	},

	Assumptions: {

		assume: function Assume(assumption, description) {
			__TestPilot.getCurrentResult().assumptions.push(assumption);
			__TestPilot.updateSummary(__TestPilot.Assumptions.assume.name, assumption.result);
			assumption.type = assumption.constructor.name;
			assumption.description = description;
			assumption.isFatalError = function() {
				return (false);
			}
			if (assumption.result == false) {
				var error = new Error(assumption.type + ": " + (assumption.description != null ? assumption.description : ""));
				error.cause = assumption;
				throw error;
			}
			return (assumption);
		},

		assumeFalse: function AssumeFalse(expr, description) {
			var fn = function AssumeFalse(value) {
				this.result = expr == false;
			};
			return (__TestPilot.Assumptions.assume(new fn(expr), description));
		},

		assumeTrue: function AssumeTrue(expr, description) {
			var fn = function AssumeTrue(value) {
				this.result = expr == true;
			};
			return (__TestPilot.Assumptions.assume(new fn(expr), description));
		}

	},

	addToNamespace: function(name, value) {
		__TestPilot.NAMESPACE[name] = value;
	},


	addResult: function(unitTest, operation) {


		var result = new __TestPilot.Result(operation);
		__TestPilot.getFrameworkState(unitTest).results.push(result);
		return (result);
	},


	getCurrentResult: function() {
		var results = __TestPilot.getFrameworkState(__TestPilot.UNIT_TEST).results;
		return (results[results.length - 1]);
	},


	getFrameworkState: function(object) {
		return (object == null ? null : object[__TestPilot.FRAMEWORK_PREFIX]);
	},


	getOperations: function(category, unitTest) {


		var result = [];
		for (var name in unitTest) {
			var operation = unitTest[name];
			var state = __TestPilot.getFrameworkState(operation);
			if (operation != null && operation.constructor == Function && state != null && state.category == category) {
				result.push(operation);
			}
		}
		return (result);
	},

	getReport: function() {
		var blankStr =  "                                                  ";

		var leftJustify = function(str, width) {
			return ((str + blankStr).substr(0, width));
		}

		var rightJustify = function(str, width) {
			str = blankStr + str;
			return (str.substr(str.length - width));
		}

		var format = function(status, category, className, operationName, description) {
			var status = leftJustify(status, 10);
			var category = leftJustify(category, 15);
			var className = leftJustify(className, 20);
			var operationName = leftJustify(operationName, 35);
			return (status + " " + category + " " + className + " " + operationName + " " + description + "\n");
		}

		var report = "TestPilot Summary\n\n";
		var title = leftJustify("Category", 15);
		var total = leftJustify("Total", 10);
		var passed = leftJustify("Passed", 10);
		var failed = leftJustify("Failed", 10);
		report += title + " " + total + " " + passed + " " + failed + "\n";
		var summary = __TestPilot.getSummary();
		for (var i in summary) {
			if (summary[i].constructor == __TestPilot.SummaryValue) {
				var title = leftJustify(i, 15);
				var total = rightJustify(summary[i].total, 5);
				var passed = rightJustify(summary[i].passed, 11);
				var failed = rightJustify(summary[i].failed, 10);
				report += title + " " + total + " " + passed + " " + failed + "\n";
			}
		}

		report += "\nTestPilot Details\n\n";
		report += format("Status", "Category", "Class", "Operation", "Description");
		var successful = true;
		var unitTestName = null;
		var results = __TestPilot.getResults();
		for (var i = 0; i < results.length; ++i) {
			var result = results[i];
			successful &= result.passed;

			if (unitTestName != null && unitTestName != result.unitTestName) {
				unitTestName = result.unitTestName;
				report += format(successful ? "Success" : "Failed", "Unit Test", results[i - 1].unitTestName, " ", results[i - 1].unitTestDescription);
				successful = true;
			}
			unitTestName = result.unitTestName;
			report += format(result.passed ? "Success" : "Failed", result.category, result.unitTestName, result.operationName, "");
			for (var j = 0; j < result.messages.length; ++j) {
				report += format("", "Message", result.unitTestName, result.operationName, result.messages[j]);
			}
			for (var j = 0; j < result.assumptions.length; ++j) {
				var assumption = result.assumptions[j];
				successful &= assumption.assumption;
				report += format(assumption.assumption ? "True" : "False", "Assumption", result.unitTestName, result.operationName, "[" + assumption.type + "] " + assumption.description);
			}
			for (var j = 0; j < result.assertions.length; ++j) {
				var assertion = result.assertions[j];
				successful &= assertion.assumption;
				report += format(assertion.result ? "True" : "False", "Assertion", result.unitTestName, result.operationName, "[" + assertion.type + "] " + assertion.description);
			}
			if (result.error != null) {
				var cause = result.error.cause;
				successful &= cause.result;
				report += format("Error", "Error", result.unitTestName, result.operationName, cause.type + ": " + cause.description);
			}
		}
		var i = results.length;
		report += format(successful ? "Success" : "Failed", "Unit Test", results[i - 1].unitTestName, "", results[i - 1].unitTestDescription);
		return (report);
	},


	getResults: function() {
		var results = [];
		for (var i = 0; i < __TestPilot.UNIT_TESTS.length; ++i) {


			var unitTest = __TestPilot.UNIT_TESTS[i];
			if (arguments.length == 0) {
				results = results.concat(__TestPilot.getFrameworkState(unitTest).results);
			}
			else {
				var unitTestTypes = arguments[0].constructor == Array ? arguments[0] : arguments;
				for (var j = 0; j < unitTestTypes.length; ++j) {
					if (unitTestTypes[j] == unitTest.constructor || unitTestTypes[j] == unitTest) {
						results = results.concat(__TestPilot.getFrameworkState(unitTest).results);
						break;
					}
				}
			}
		}
		return (results);
	},


	getSummary: function() {
		if (__TestPilot.SUMMARY == null) {
			__TestPilot.SUMMARY = new __TestPilot.Summary();
		}
		return (__TestPilot.SUMMARY);
	},

	initializeAliases: function() {
		var containers = [__TestPilot, __TestPilot.Assertions, __TestPilot.Assumptions];
		for (var i = 0; i < containers.length; ++i) {
			var container = containers[i];
			for (var j in container) {
				if (container[j] != null && container[j].constructor == Function && container[j].name != "") {
					var namespaceName = __TestPilot.NAMESPACE_PREFIX + container[j].name;
					__TestPilot.addToNamespace(namespaceName, container[j]);
					__TestPilot.ALIASED_FUNCTIONS.push(namespaceName);
				}
			}
		}
	},


	initializeFrameworkState: function(object) {
		if (object != null && object[__TestPilot.FRAMEWORK_PREFIX] == null) {
			object[__TestPilot.FRAMEWORK_PREFIX] = {
				results: []
			};
		}
	},


	initializeTestPilotFramework: function() {
		__TestPilot.UNIT_TESTS = [];
		__TestPilot.UNIT_TEST = null;
		__TestPilot.SUMMARY = null;
		__Annotations.setNamespace(__TestPilot.NAMESPACE);
		__Annotations.setNamespacePrefix(__TestPilot.NAMESPACE_PREFIX);
		__TestPilot.initializeAliases();
		__Annotations.defineAnnotation(__TestPilot.AnnotationTypes.TestPilotAnnotation, __Annotations.addAnnotations(__Annotations.AnnotationTypes.TypeAnnotation));
		__Annotations.defineAnnotation(__TestPilot.AnnotationTypes.AfterAnnotation, __Annotations.addAnnotations(__Annotations.AnnotationTypes.MethodAnnotation, __TestPilot.AnnotationTypes.TestPilotAnnotation));
		__Annotations.defineAnnotation(__TestPilot.AnnotationTypes.AfterClassAnnotation, __Annotations.addAnnotations(__Annotations.AnnotationTypes.MethodAnnotation, __TestPilot.AnnotationTypes.TestPilotAnnotation));
		__Annotations.defineAnnotation(__TestPilot.AnnotationTypes.BeforeAnnotation, __Annotations.addAnnotations(__Annotations.AnnotationTypes.MethodAnnotation, __TestPilot.AnnotationTypes.TestPilotAnnotation));
		__Annotations.defineAnnotation(__TestPilot.AnnotationTypes.BeforeClassAnnotation, __Annotations.addAnnotations(__Annotations.AnnotationTypes.MethodAnnotation, __TestPilot.AnnotationTypes.TestPilotAnnotation));
		__Annotations.defineAnnotation(__TestPilot.AnnotationTypes.IgnoreAnnotation, __Annotations.addAnnotations(__Annotations.AnnotationTypes.MethodAnnotation, __TestPilot.AnnotationTypes.TestPilotAnnotation));
		__Annotations.defineAnnotation(__TestPilot.AnnotationTypes.TestAnnotation, __Annotations.addAnnotations(__Annotations.AnnotationTypes.MethodAnnotation, __TestPilot.AnnotationTypes.TestPilotAnnotation));
		__Annotations.defineAnnotation(__TestPilot.AnnotationTypes.UnitTestAnnotation, __Annotations.addAnnotations(__Annotations.AnnotationTypes.TypeAnnotation, __Annotations.AnnotationTypes.ObjectAnnotation, __TestPilot.AnnotationTypes.TestPilotAnnotation));
	},


	initializeUnitTests: function() {
		var unitTestTypes = __Annotations.getAnnotatedConstructs(__TestPilot.AnnotationTypes.UnitTestAnnotation);
		for (var i = 0; i < unitTestTypes.length; ++i) {


			var unitTestType = unitTestTypes[i];
			var unitTestDescription =__Annotations.getAnnotations(unitTestType)[0].description;
			__TestPilot.initializeFrameworkState(unitTestType);
			var unitTest = unitTestType.constructor == Function ? new unitTestType() : unitTestType;
			__TestPilot.UNIT_TESTS.push(unitTest);


			for (var operationName in unitTest) {
				var operation = unitTest[operationName];
				if (operation != null && operation.constructor == Function) {
					var annotations = __Annotations.getAnnotations(operation);
					if (annotations != null && annotations.length > 0) {
						operation[__TestPilot.FRAMEWORK_PREFIX] = new __TestPilot.Operation(unitTest.constructor.name, unitTestDescription, operationName, annotations[0].constructor.name, annotations[0].description);
					}
				}
			}
		}

		return (unitTestTypes);
	},


	invokeOperation: function(unitTest, operation) {


		var result = __TestPilot.addResult(unitTest, operation);
		try {
			operation.apply(unitTest, []);
		}
		catch (e) {


			result.error = e;
			result.passed = e.cause != null ? !e.cause.isFatalError() : false;
		}
		finally {
			__TestPilot.updateSummary(__TestPilot.getFrameworkState(operation).category, result.passed);
		}
		return (result == null ? false : result.passed);
	},


	invokeOperations: function(category, unitTest) {
		var passed = true;
		var operations = __TestPilot.getOperations(category, unitTest);
		for (var i = 0; i < operations.length; ++i) {
			passed &= __TestPilot.invokeOperation(unitTest, operations[i]);
		}
		return (passed);
	},


	message: function Message(value) {
		__TestPilot.getCurrentResult().messages.push(value);
		__TestPilot.updateSummary(__TestPilot.message.name, true);
	},

	removeFromNamespace: function(name) {
		delete __TestPilot.NAMESPACE[name];
	},


	removeTestPilotFramework: function() {


		for (var i = 0; i < __TestPilot.ALIASED_FUNCTIONS.length; ++i) {
			__TestPilot.removeFromNamespace(__TestPilot.ALIASED_FUNCTIONS[i]);
		}


		__Annotations.removeAnnotationsFramework();
	},


	runUnitTests: function() {
		__TestPilot.getSummary();
		__TestPilot.initializeUnitTests();


		for (var i = 0; i < __TestPilot.UNIT_TESTS.length; ++i) {
			var unitTest = __TestPilot.UNIT_TESTS[i];
			__TestPilot.initializeFrameworkState(unitTest);
			__TestPilot.UNIT_TEST = unitTest;


			var passed = __TestPilot.invokeOperations(__TestPilot.AnnotationTypes.BeforeClassAnnotation.name, unitTest);
			var operations = __TestPilot.getOperations(__TestPilot.AnnotationTypes.TestAnnotation.name, unitTest);
			for (var j = 0; j < operations.length; ++j) {
				passed &= __TestPilot.invokeOperations(__TestPilot.AnnotationTypes.BeforeAnnotation.name, unitTest);
				passed &= __TestPilot.invokeOperation(unitTest, operations[j]);
				passed &= __TestPilot.invokeOperations(__TestPilot.AnnotationTypes.AfterAnnotation.name, unitTest);
			}
			passed &= __TestPilot.invokeOperations(__TestPilot.AnnotationTypes.AfterClassAnnotation.name, unitTest);
			__TestPilot.updateSummary(__TestPilot.AnnotationTypes.UnitTestAnnotation.name, passed);
			__TestPilot.SUMMARY[__TestPilot.AnnotationTypes.IgnoreAnnotation.name].total += __TestPilot.getOperations(__TestPilot.AnnotationTypes.IgnoreAnnotation.name, unitTest).length;
		}
		__TestPilot.UNIT_TEST = null;
	},


	setFrameworkPrefix: function(frameworkPrefix) {
		if (frameworkPrefix != null) {
			__TestPilot.removeTestPilotFramework();
			__TestPilot.FRAMEWORK_PREFIX = frameworkPrefix.toString();
			__TestPilot.initializeTestPilotFramework();
		}
	},


	setNamespace: function(namespace) {
		if (namespace != null) {
			__TestPilot.removeTestPilotFramework();
			__TestPilot.NAMESPACE = namespace;
			__TestPilot.initializeTestPilotFramework();
		}
	},


	setNamespacePrefix: function(namespacePrefix) {
		if (namespacePrefix != null) {
			__TestPilot.removeTestPilotFramework();
			__TestPilot.NAMESPACE_PREFIX = namespacePrefix.toString();
			__TestPilot.initializeTestPilotFramework();
		}
	},


	updateSummary: function(category, result) {
		__TestPilot.SUMMARY[category].update(result);
	}

}

__TestPilot.initializeTestPilotFramework();
