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

// testpilot.js/src/main/javascript/testpilot.js

var __TestPilot = {

	FRAMEWORK_PREFIX: "__TestPilot",
	NAMESPACE_PREFIX: "$",
	NAMESPACE: this,
	ALIASED_FUNCTIONS: [],
	UNIT_TESTS: [],
	UNIT_TEST: null,
	SUMMARY: null,

	AnnotationTypes: {

		// $TypeAnnotation();
		TestPilotAnnotation: function TestPilotAnnotation() {
		},

		// $MethodAnnotation(); $TestPilotAnnotation();
		AfterAnnotation: function After(description) {
			this.description = description;
		},

		// $MethodAnnotation(); $TestPilotAnnotation();
		AfterClassAnnotation: function AfterClass(description) {
			this.description = description;
		},

		// $MethodAnnotation(); $TestPilotAnnotation();
		BeforeAnnotation: function Before(description) {
			this.description = description;
		},

		// $MethodAnnotation(); $TestPilotAnnotation();
		BeforeClassAnnotation: function BeforeClass(description) {
			this.description = description;
		},

		// $MethodAnnotation(); $TestPilotAnnotation();
		IgnoreAnnotation: function Ignore(description) {
			this.description = description;
		},

		// $MethodAnnotation(); $TestPilotAnnotation();
		TestAnnotation: function Test(description) {
			this.description = description;
		},

		// $TypeAnnotation(); $ObjectAnnotation(); $TestPilotAnnotation();
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
		}

		this.getUnitTestSummary = function() {
			return (this[members[0]]);
		}

		this.getBeforeSummary = function() {
			return (this[members[1]]);
		}

		this.getBeforeClassSummary = function() {
			return (this[members[2]]);
		}

		this.getAfterSummary = function() {
			return (this[members[3]]);
		}

		this.getAfterClassSummary = function() {
			return (this[members[4]]);
		}

		this.getTestSummary = function() {
			return (this[members[5]]);
		}

		this.getIgnoreSummary = function() {
			return (this[members[6]]);
		}

		this.getAssertionSummary = function() {
			return (this[members[7]]);
		}

		this.getAssumptionSummary = function() {
			return (this[members[8]]);
		}

		this.getMessageSummary = function() {
			return (this[members[9]]);
		}

	},

	SummaryValue: function(total, passed, failed) {
		this.total = total;
		this.passed = passed;
		this.failed = failed;

		this.update = function(successful) {
			this.total++;
			this.passed += successful == true ? 1 : 0;
			this.failed += successful == false ? 1 : 0;
		}
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

	// Adds a new Result ot the specified unit test.

	addResult: function(unitTest, operation) {

		// Create a new result descriptor, then add it to the results
		// descriptor attached to the current test object.

		var result = new __TestPilot.Result(operation);
		__TestPilot.getFrameworkState(unitTest).results.push(result);
		return (result);
	},

	// Retrieves the current Result object.

	getCurrentResult: function() {
		var results = __TestPilot.getFrameworkState(__TestPilot.UNIT_TEST).results;
		return (results[results.length - 1]);
	},

	// Retrieve the state attached to the specified construct or null if no
	// construct was provided.

	getFrameworkState: function(object) {
		return (object == null ? null : object[__TestPilot.FRAMEWORK_PREFIX]);
	},

	// Retrieves the set of operations defined in the specified unit test that
	// match the specified criteria.

	getOperations: function(category, unitTest) {

		// Create a set of all operations defined in the test class that
		// that matches the specified category.

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

	// Retrieves detailed unit test results for all unit tests or for only those
	// unit tests specified in the argument list.

	getResults: function() {
		var results = [];
		for (var i = 0; i < __TestPilot.UNIT_TESTS.length; ++i) {

			// If specific test classes have been requested, filter the result
			// based on the list of types present in the paramater list.

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

	// Retrieves a summary of unit test results.

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

	// Initializes the specified construct.

	initializeFrameworkState: function(object) {
		if (object != null && object[__TestPilot.FRAMEWORK_PREFIX] == null) {
			object[__TestPilot.FRAMEWORK_PREFIX] = {
				results: []
			};
		}
	},

	// Initialize the TestPilot framework.

	initializeTestPilotFramework: function() {
		__TestPilot.UNIT_TESTS = [];
		__TestPilot.UNIT_TEST = null;
		__TestPilot.SUMMARY = null;
		__Annotations.setNamespace(__TestPilot.NAMESPACE);
		__Annotations.setNamespacePrefix(__TestPilot.NAMESPACE_PREFIX);
//		__Annotations.initializeAnnotationsFramework();
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

	// Initialize all defined unit tests.

	initializeUnitTests: function() {
		var unitTestTypes = __Annotations.getAnnotatedConstructs(__TestPilot.AnnotationTypes.UnitTestAnnotation);
		for (var i = 0; i < unitTestTypes.length; ++i) {

			// Initialize the test class, then create a new instance of it.

			var unitTestType = unitTestTypes[i];
//			var unitTestDescription = __Annotations.getFrameworkState(unitTestType).annotations[0].description;
			var unitTestDescription =__Annotations.getAnnotations(unitTestType)[0].description;
			__TestPilot.initializeFrameworkState(unitTestType);
			var unitTest = unitTestType.constructor == Function ? new unitTestType() : unitTestType;
			__TestPilot.UNIT_TESTS.push(unitTest);

			// Locate the next operation without an operation descriptor, then
			// attach the current operation descriptor to the operation.

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

	// Invokes the specified operation within the specified unit test.

	invokeOperation: function(unitTest, operation) {

		// Create a new result, add it to the set of Result objects associated
		// with the operation, then invoke the operation.

		var result = __TestPilot.addResult(unitTest, operation);
		try {
			operation.apply(unitTest, []);
		}
		catch (e) {

			// Store exceptions in the result.

			result.error = e;
			result.passed = !e.cause.isFatalError();
		}
		finally {
			__TestPilot.updateSummary(__TestPilot.getFrameworkState(operation).category, result.passed);
		}
		return (result == null ? false : result.passed);
	},

	// Invoke all operations in the unit test that match the specified category.

	invokeOperations: function(category, unitTest) {
		var passed = true;
		var operations = __TestPilot.getOperations(category, unitTest);
		for (var i = 0; i < operations.length; ++i) {
			passed &= __TestPilot.invokeOperation(unitTest, operations[i]);
		}
		return (passed);
	},

	// Adds a message to the current test result.

	message: function Message(value) {
		__TestPilot.getCurrentResult().messages.push(value);
		__TestPilot.updateSummary(__TestPilot.message.name, true);
	},

	removeFromNamespace: function(name) {
		delete __TestPilot.NAMESPACE[name];
	},

	// Remove function aliases and annotations from the global NAMESPACE and
	// remove framework state from all managed object.

	removeTestPilotFramework: function() {

		// Delete all function aliases from the global namespace.

		for (var i = 0; i < __TestPilot.ALIASED_FUNCTIONS.length; ++i) {
			__TestPilot.removeFromNamespace(__TestPilot.ALIASED_FUNCTIONS[i]);
		}

		// Delete all defined annotations and remove convenience functions from
		// the global namespace.

		__Annotations.removeAnnotationsFramework();
	},

	// Run all registered unit tests.

	runUnitTests: function() {
		__TestPilot.getSummary();
		__TestPilot.initializeUnitTests();

		// For each unit test, execute all registered test functions.

		for (var i = 0; i < __TestPilot.UNIT_TESTS.length; ++i) {
			var unitTest = __TestPilot.UNIT_TESTS[i];
			__TestPilot.initializeFrameworkState(unitTest);
			__TestPilot.UNIT_TEST = unitTest;

			// Invoke the before class, before, test, after, and after class
			// operations defined in the test class.

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

	// Sets the prefix, which the unit test framework uses to attach state to
	// types, objects, and methods (e.g.: constructs), to the specified value.
	// The default prefix is "__Annotations".

	setFrameworkPrefix: function(frameworkPrefix) {
		if (frameworkPrefix != null) {
			__TestPilot.removeTestPilotFramework();
			__TestPilot.FRAMEWORK_PREFIX = frameworkPrefix.toString();
			__TestPilot.initializeTestPilotFramework();
		}
	},

	// Sets the namespace, which is used to publish/make easily available
	// annotations, annotated types, and methods, to the specified value.  The
	// default namespace is "this" (e.g.: window).

	setNamespace: function(namespace) {
		if (namespace != null) {
			__TestPilot.removeTestPilotFramework();
			__TestPilot.NAMESPACE = namespace;
			__TestPilot.initializeTestPilotFramework();
		}
	},

	// Sets the namespace prefix, which prefixes all globally defined annotation
	// types and methods, to the specified value.  The default namespace
	// prefix is "$".

	setNamespacePrefix: function(namespacePrefix) {
		if (namespacePrefix != null) {
			__TestPilot.removeTestPilotFramework();
			__TestPilot.NAMESPACE_PREFIX = namespacePrefix.toString();
			__TestPilot.initializeTestPilotFramework();
		}
	},

	// Updates the specified summary category, specifically the total, passed,
	// and failed information stored in the summary value.

	updateSummary: function(category, result) {
		__TestPilot.SUMMARY[category].update(result);
	}

}

__TestPilot.initializeTestPilotFramework();
