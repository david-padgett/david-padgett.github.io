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


function TestPilot(rootNamespace, namespacePrefix) {


	var __THIS = this;
	var __ROOT_NAMESPACE = rootNamespace;
	var __NAMESPACE_PREFIX = namespacePrefix == null ? "$" : namespacePrefix;
	var __MODULE_PREFIX = __NAMESPACE_PREFIX + this.constructor.name;
	var __MODULE = new __Module(new __ModuleDelegate());
	var __BLANKS = new Array(51).join(' ');


	function __getCurrentResult() {
		var results = __THIS.unitTest[__MODULE_PREFIX].results;
		return (results[results.length - 1][1]);
	}

	function __leftJustify(str, width) {
		return ((str + __BLANKS).substr(0, width));
	}

	function __rightJustify(str, width) {
		str = __BLANKS + str;
		return (str.substr(str.length - width));
	}

	function __format(status, category, className, operationName, description) {
		var status = __leftJustify(status, 10);
		var category = __leftJustify(category, 15);
		var className = __leftJustify(className, 20);
		var operationName = __leftJustify(operationName, 35);
		return (status + " " + category + " " + className + " " + operationName + " " + description + "\n");
	}


	function __Module(delegate) {





		this.__delegate = delegate;
		this.__containers = [];




		this.addToNamespace = function addToNamespace(name, value) {
			__ROOT_NAMESPACE[name] = value;
			this.invokeDelegate(arguments.callee.name);
		};


		this.invokeDelegate = function(operation) {
			if (this.__delegate != null && this.__delegate[operation] != null && this.__delegate[operation].constructor === Function) {
				delegate[operation].apply(delegate, Array.prototype.slice.call(arguments, 1));
			}
		}


		this.initializeDispatcher = function(container, api) {
			var dispatcher = function __ModuleApiDispatcher() {
				var args = Array.prototype.slice.call(arguments, 0);
				return (api.apply(container, args));
			};
			return (dispatcher);
		};


		this.install = function install(containers) {
			this.__containers = containers;
			this.manageAliases(this.__containers, true);
			this.invokeDelegate(arguments.callee.name);
		};


		this.manageAliases = function(containers, addFunctions) {
			for (var i = 0; i < containers.length; ++i) {
				var container = containers[i];
				for (var j in container) {
					if (container[j] != null) {
						var name = null;
						var value = null;
						if (container[j].constructor !== Function && j[0] != "_") {
							name = __NAMESPACE_PREFIX + j;
							value = container[j];
						}
						else {
							if (container[j].constructor === Function && container[j].name.length > 0) {
								var api = container[j];
								var name = __NAMESPACE_PREFIX + container[j].name;
								value = this.initializeDispatcher(container, api);
							}
						}
						if (name != null && value != null) {
							if (addFunctions) {
								this.addToNamespace(name, value);
							}
							else {
								this.removeFromNamespace(name);
							}
						}
					}
				}
			}
		};


		this.removeFromNamespace = function removeFromNamespace(name) {
			this.invokeDelegate(arguments.callee.name);
			if (!(delete __ROOT_NAMESPACE[name])) {
				__ROOT_NAMESPACE[name] = null;
			}
		};


		this.uninstall = function uninstall() {
			this.invokeDelegate(arguments.callee.name);
			this.manageAliases(this.__containers, false);
		};


		if (__ROOT_NAMESPACE == null) {
			throw new Error("Unable to initialize " + __THIS.constructor.name + ": No root namespace provided when instantiated.");
		}

	}

	function __ModuleDelegate() {







		this.install = function() {
			__THIS.initializeAnnotations();
		};

		this.uninstall = function() {
			__THIS.annotations.removeAnnotationsFramework();
		};


	}

	function Operation(name, category, description) {





		this.name = name;
		this.category = category;
		this.description = description;




	};

	function Result(unitTest, operation) {





		this.assertions = [];
		this.assumptions = [];
		this.messages = [];
		this.successful = true;




	};

	function Summary() {


		var members = [
			__THIS.annotationTypes.UnitTestAnnotation.name,
			__THIS.annotationTypes.BeforeClassAnnotation.name,
			__THIS.annotationTypes.AfterClassAnnotation.name,
			__THIS.annotationTypes.BeforeAnnotation.name,
			__THIS.annotationTypes.AfterAnnotation.name,
			__THIS.annotationTypes.TestAnnotation.name,
			__THIS.annotationTypes.IgnoreAnnotation.name,
			__THIS.assertions.assert.name,
			__THIS.assumptions.assume.name,
			__THIS.message.name
		];






		this.getAfterSummary = function() {
			return (this[members[4]]);
		};

		this.getAfterClassSummary = function() {
			return (this[members[2]]);
		};

		this.getAssertionSummary = function() {
			return (this[members[7]]);
		};

		this.getAssumptionSummary = function() {
			return (this[members[8]]);
		};

		this.getBeforeSummary = function() {
			return (this[members[3]]);
		};

		this.getBeforeClassSummary = function() {
			return (this[members[1]]);
		};

		this.getIgnoreSummary = function() {
			return (this[members[6]]);
		};

		this.getMessageSummary = function() {
			return (this[members[9]]);
		};

		this.getTestSummary = function() {
			return (this[members[5]]);
		};

		this.getUnitTestSummary = function() {
			return (this[members[0]]);
		};


		for (var i = 0; i < members.length; ++i) {
			this[members[i]] = new SummaryValue(0, 0, 0);
		};

	};

	function SummaryValue(total, passed, failed) {





		this.total = total;
		this.passed = passed;
		this.failed = failed;



		this.update = function(successful) {
			this.total++;
			this.passed += successful == true ? 1 : 0;
			this.failed += successful == false ? 1 : 0;
		};


	};


	this.annotations = new Annotations(__ROOT_NAMESPACE, __NAMESPACE_PREFIX);
	this.aliasedFunctions = [];
	this.unitTests = [];
	this.unitTest = null;
	this.summary = null;

	this.annotationTypes = {

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

	};

	this.assertions = {

		assert: function Assert(assertion, description) {
			__getCurrentResult().assertions.push(assertion);
			__THIS.summary[this.assert.name].update(assertion.result);
			assertion.type = assertion.constructor.name;
			assertion.description = description;
			assertion.isFatalError = function() {
				return (true);
			};
			if (assertion.result == false) {
				var error = new Error(assertion.type + ": " + (assertion.description != null ? assertion.description : ""));
				error.cause = assertion;
				error.frameworkError = true;
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
			return (this.assert(new fn(expr1, expr2), description));
		},

		assertEquals: function AssertEquals(expr1, expr2, description) {
			var fn = function AssertEquals(value1, value2) {
				this.result = value1 == value2;
			};
			return (this.assert(new fn(expr1, expr2), description));
		},

		assertFalse: function AssertFalse(expr, description) {
			var fn = function AssertFalse(value) {
				this.result = value == false;
			};
			return (this.assert(new fn(expr), description));
		},

		assertIdentical: function AssertIdentical(expr1, expr2, description) {
			var fn = function AssertSame(value1, value2) {
				this.result = value1 === value2;
			};
			return (this.assert(new fn(expr1, expr2), description));
		},

		assertNotEquals: function AssertNotEquals(expr1, expr2, description) {
			var fn = function AssertNotEquals(value1, value2) {
				this.result = value1 != value2;
			};
			return (this.assert(new fn(expr1, expr2), description));
		},

		assertNotNull: function AssertNotNull(expr, description) {
			var fn = function AssertNotNull(value) {
				this.result = value != null;
			};
			return (this.assert(new fn(expr), description));
		},

		assertNotIdentical: function AssertNotIdentical(expr1, expr2, description) {
			var fn = function AssertNotSame(value1, value2) {
				this.result = value1 !== value2;
			};
			return (this.assert(new fn(expr1, expr2), description));
		},

		assertNull: function AssertNull(expr, description) {
			var fn = function AssertNull(value) {
				this.result = value == null;
			};
			return (this.assert(new fn(expr), description));
		},

		assertTrue: function AssertTrue(expr, description) {
			var fn = function AssertTrue(value) {
				this.result = expr == true;
			};
			return (this.assert(new fn(expr), description));
		},

		error: function Error(expr, expectedError, description) {
			var fn = function Error(expr) {
				try {
					expr();
					this.result = false;
				}
				catch (e) {
					this.result = expectedError == null ? true : expectedError.constructor === e.constructor && (expectedError.message === null || expectedError.message == e.message);
					if (!this.result) {
						throw e;
					}
				}
			};
			return (this.assert(new fn(expr), description));
		}

	};

	this.assumptions = {

		assume: function Assume(assumption, description) {
			__getCurrentResult().assumptions.push(assumption);
			__THIS.summary[this.assume.name].update(assumption.result);
			assumption.type = assumption.constructor.name;
			assumption.description = description;
			assumption.isFatalError = function() {
				return (false);
			}
			if (assumption.result == false) {
				var error = new Error(assumption.type + ": " + (assumption.description != null ? assumption.description : ""));
				error.cause = assumption;
				error.frameworkError = true;
				throw error;
			}
			return (assumption);
		},

		assumeFalse: function AssumeFalse(expr, description) {
			var fn = function AssumeFalse(value) {
				this.result = expr === false;
			};
			return (this.assume(new fn(expr), description));
		},

		assumeTrue: function AssumeTrue(expr, description) {
			var fn = function AssumeTrue(value) {
				this.result = expr === true;
			};
			return (this.assume(new fn(expr), description));
		}

	};




	this.getOperations = function(unitTest, category) {


		var result = [];
		for (var name in unitTest) {
			var operation = unitTest[name];
			var state = operation[__MODULE_PREFIX];
			if (operation != null && operation.constructor == Function && state != null && (category == null || state.category == category)) {
				result.push(operation);
			}
		}
		return (result);
	};

	this.getReport = function() {
		var report = "TestPilot Summary\n\n";
		var title = __leftJustify("Category", 15);
		var total = __leftJustify("Total", 10);
		var passed = __leftJustify("Passed", 10);
		var failed = __leftJustify("Failed", 10);
		report += title + " " + total + " " + passed + " " + failed + "\n";
		var summary = this.getSummary();
		for (var i in summary) {
			if (summary[i].constructor == SummaryValue) {
				var title = __leftJustify(i, 15);
				var total = __rightJustify(summary[i].total, 5);
				var passed = __rightJustify(summary[i].passed, 11);
				var failed = __rightJustify(summary[i].failed, 10);
				report += title + " " + total + " " + passed + " " + failed + "\n";
			}
		}

		report += "\nTestPilot Details\n\n";
		report += __format("Status", "Category", "Class", "Operation", "Description");

		for (var i = 0; i < this.unitTests.length; ++i) {
			var unitTest = this.unitTests[i];
			var unitTestState = unitTest[__MODULE_PREFIX];
			var results = unitTestState.results;
			var details = "";
			for (var j = 0; j < results.length; ++j) {
				var operation = results[j][0];
				var result = results[j][1];
				var operationState = operation[__MODULE_PREFIX];
				details += __format(result.successful ? "Success" : "Failed", operationState.category, unitTestState.name, operationState.name, result.description != null ? result.description : "");
				for (var k = 0; k < result.messages.length; ++k) {
					details += __format("", "Message", unitTestState.name, operationState.name, result.messages[k]);
				}
				for (var k = 0; k < result.assumptions.length; ++k) {
					var assumption = result.assumptions[k];
					details += __format(assumption.result ? "True" : "False", "Assumption", unitTestState.name, operationState.name, "[" + assumption.type + "] " + (assumption.description != null ? assumption.description : ""));
				}
				for (var k = 0; k < result.assertions.length; ++k) {
					var assertion = result.assertions[k];
					details += __format(assertion.result ? "True" : "False", "Assertion", unitTestState.name, operationState.name, "[" + assertion.type + "] " + (assertion.description != null ? assertion.description : ""));
				}
				if (result.error != null && !result.error.frameworkError) {
					details += __format("Error", "Error", unitTestState.name, operationState.name, result.error.cause == null ? "" : result.error.cause.type + ": " + result.error.cause.description);
				}
			}
			report += __format(unitTestState.successful ? "Success" : "Failed", this.annotationTypes.UnitTestAnnotation.name, unitTestState.name, "", unitTestState.description) + details;
		}
		return (report);
	};


	this.getResults = function() {
		var results = [];
		for (var i = 0; i < this.unitTests.length; ++i) {


			var unitTest = this.unitTests[i];
			if (arguments.length == 0) {
				results = results.concat(unitTest[__MODULE_PREFIX].results);
			}
			else {
				var unitTestTypes = Array.prototype.slice.call(arguments);
				for (var j = 0; j < unitTestTypes.length; ++j) {
					if (unitTestTypes[j] == unitTest.constructor || unitTestTypes[j] == unitTest) {
						results = results.concat(unitTest[__MODULE_PREFIX].results);
						break;
					}
				}
			}
		}
		return (results);
	};


	this.getSummary = function() {
		if (this.summary == null) {
			this.summary = new Summary(this.summarySections);
		}
		return (this.summary);
	};

	this.initializeAnnotations = function() {
		this.annotations.annotate(this.annotationTypes.AfterAnnotation, this.annotations.addAnnotation("MethodAnnotation"));
		this.annotations.annotate(this.annotationTypes.AfterClassAnnotation, this.annotations.addAnnotation("MethodAnnotation"));
		this.annotations.annotate(this.annotationTypes.BeforeAnnotation, this.annotations.addAnnotation("MethodAnnotation"));
		this.annotations.annotate(this.annotationTypes.BeforeClassAnnotation, this.annotations.addAnnotation("MethodAnnotation"));
		this.annotations.annotate(this.annotationTypes.IgnoreAnnotation, this.annotations.addAnnotation("MethodAnnotation"));
		this.annotations.annotate(this.annotationTypes.TestAnnotation, this.annotations.addAnnotation("MethodAnnotation"));
		this.annotations.annotate(this.annotationTypes.UnitTestAnnotation, this.annotations.addAnnotation("TypeAnnotation"));
	};

	this.initializeUnitTest = function(unitTest) {
		if (unitTest != null && unitTest[__MODULE_PREFIX] == null) {
			unitTest[__MODULE_PREFIX] = {
				name: null,
				description: null,
				successful: true,
				results: []
			};
			this.unitTests.push(unitTest);
		}
	};


	this.initializeUnitTests = function() {
		var unitTestTypes = this.annotations.getAnnotatedConstructs(this.annotationTypes.UnitTestAnnotation);
		for (var i = 0; i < unitTestTypes.length; ++i) {


			var unitTestType = unitTestTypes[i];
			try {
				var unitTest = unitTestType.constructor == Function ? this.annotations.createAnnotatedInstance(unitTestType) : unitTestType;
				this.initializeUnitTest(unitTest);


				var state = unitTest[__MODULE_PREFIX];
				state.name = unitTestType.constructor == Function ? unitTestType.name : unitTest.constructor.name;
				state.description = this.annotations.getAnnotations(unitTestType)[0].description;
				for (var operationName in unitTest) {
					var operation = unitTest[operationName];
					if (operation != null && operation.constructor == Function && operationName != "constructor") {
						var annotations = this.annotations.getAnnotations(operation);
						if (annotations != null && annotations.length > 0) {
							operation[__MODULE_PREFIX] = new Operation(operationName, annotations[0].constructor.name, annotations[0].description);
						}
					}
				}
			}
			catch (e) {
				this.initializeUnitTest(unitTestType);
				unitTestType[__MODULE_PREFIX].successful = false;
				this.unitTests.push(unitTestType);
			}
		}
	};


	this.invokeOperation = function(unitTest, operation) {


		var result = new Result(unitTest, operation);
		unitTest[__MODULE_PREFIX].results.push([operation, result]);
		try {
			operation.apply(unitTest, []);
		}
		catch (e) {


			result.error = e;
			result.successful = e.cause != null ? !e.cause.isFatalError() : false;
			if (e.cause == null) {
				e.frameworkError = false;
				e.cause = {
					type: e.message,
					description: e.stack
				}
			}
		}
		finally {
			unitTest[__MODULE_PREFIX].successful = unitTest[__MODULE_PREFIX].successful && result.successful;
			this.summary[operation[__MODULE_PREFIX].category].update(result.successful);
		}
	};


	this.invokeOperations = function(unitTest, category) {
		var operations = this.getOperations(unitTest, category);
		for (var i = 0; i < operations.length; ++i) {
			this.invokeOperation(unitTest, operations[i]);
		}
	};

	this.message = function Message(value) {
		__getCurrentResult().messages.push(value);
		this.summary[this.message.name].update(true);
	};

	this.registerUnitTest = function RegisterUnitTest(unitTest) {
		this.annotations.annotate(unitTest);
	};


	this.runUnitTests = function() {
		this.getSummary();
		this.initializeUnitTests();


		for (var i = 0; i < this.unitTests.length; ++i) {
			this.unitTest = this.unitTests[i];


			this.invokeOperations(this.unitTest, this.annotationTypes.BeforeClassAnnotation.name);
			var operations = this.getOperations(this.unitTest, this.annotationTypes.TestAnnotation.name);
			for (var j = 0; j < operations.length; ++j) {
				this.invokeOperations(this.unitTest, this.annotationTypes.BeforeAnnotation.name);
				this.invokeOperation(this.unitTest, operations[j]);
				this.invokeOperations(this.unitTest, this.annotationTypes.AfterAnnotation.name);
			}
			this.invokeOperations(this.unitTest, this.annotationTypes.AfterClassAnnotation.name);
			this.summary[this.annotationTypes.UnitTestAnnotation.name].update(this.unitTest[__MODULE_PREFIX].successful);
			this.summary[this.annotationTypes.IgnoreAnnotation.name].total += this.getOperations(this.unitTest, this.annotationTypes.IgnoreAnnotation.name).length;
		}
		this.unitTest = null;
		return (this.unitTests);
	};


	__MODULE.install([__THIS, this.assertions, this.assumptions]);
}
