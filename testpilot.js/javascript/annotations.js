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


var __Annotations = {

	FRAMEWORK_PREFIX: "__Annotations",
	NAMESPACE_PREFIX: "$",
	NAMESPACE: this,
	ALIASED_FUNCTIONS: [],
	ANNOTATION_TYPES: {},
	UNBOUND_ANNOTATIONS: [],
	ANNOTATED_CONSTRUCTS: [],
	CONSTRUCT: null,

	AnnotationTypes: {


		MethodAnnotation: function MethodAnnotation() {
		},


		ObjectAnnotation: function ObjectAnnotation() {
		},


		TypeAnnotation: function TypeAnnotation() {
		},


		ValueAnnotation: function ValueAnnotation(value) {
			this.value = value;
		}

	},


	addAnnotatedConstruct: function(construct) {
		__Annotations.CONSTRUCT = construct;
		if (construct != null) {
			for (var i = __Annotations.ANNOTATED_CONSTRUCTS.length; i >= 0; --i) {
				var annotatedConstruct = __Annotations.ANNOTATED_CONSTRUCTS[i];
				if (annotatedConstruct == construct || (annotatedConstruct != null && annotatedConstruct.prototype == construct)) {
					return;
				}
			}
			__Annotations.ANNOTATED_CONSTRUCTS.push(construct);
		}
	},


	addAnnotations: function AddAnnotations() {
		for (var i = 0; i < arguments.length; ++i) {
			var frameworkState = __Annotations.getFrameworkState(arguments[i]);
			if (frameworkState != null) {
				__Annotations.ANNOTATION_TYPES[frameworkState.name]();
			}
		}
	},


	addToNamespace: function(name, value) {
		__Annotations.NAMESPACE[name] = value;
	},


	annotate: function Annotate(construct) {


		if (construct != null) {
			if (construct.constructor == Function) {
				if (__Annotations.contains(__Annotations.CONSTRUCT, construct)) {
					__Annotations.annotateConstruct(construct, __Annotations.AnnotationTypes.MethodAnnotation, __Annotations.getFrameworkState(__Annotations.CONSTRUCT).unboundAnnotations);
					return;
				}
				__Annotations.annotateConstruct(construct, construct.systemAnnotation ? null : __Annotations.AnnotationTypes.TypeAnnotation, __Annotations.UNBOUND_ANNOTATIONS);
			}
			else {


				__Annotations.annotateConstruct(construct, __Annotations.AnnotationTypes.ObjectAnnotation, __Annotations.UNBOUND_ANNOTATIONS);
				for (var methodName in construct) {
					var method = construct[methodName];
					if (method.constructor == Function && __Annotations.getFrameworkState(method) == null) {
						__Annotations.annotateConstruct(method, __Annotations.AnnotationTypes.MethodAnnotation, __Annotations.getFrameworkState(construct).unboundAnnotations);
					}
				}
			}


			__Annotations.addAnnotatedConstruct(construct);
		}
	},


	annotateConstruct: function(construct, constructType, unboundAnnotations) {


		__Annotations.initializeFrameworkState(construct, constructType);


		for (unboundAnnotations = unboundAnnotations.reverse(); unboundAnnotations.length != 0;) {
			var annotation = unboundAnnotations.pop();
			if (__Annotations.getFrameworkState(annotation.constructor).annotations.length == 0 || __Annotations.hasAnnotation(annotation.constructor, constructType)) {
				__Annotations.getFrameworkState(construct).annotations.push(annotation);
			}
		}
	},


	bindAnnotations: function BindAnnotations(construct) {
		__Annotations.annotate(construct != null ? construct : __Annotations.CONSTRUCT);
	},


	contains: function(object, member) {
		if (object != null && member != null) {
			for (var i in object) {
				if (object[i] == member) {
					return (true);
				}
			}
		}
		return (false);
	},


	defineAnnotation: function DefineAnnotation(annotationType, annotationPrefix) {

		if (annotationType == null || annotationType.constructor != Function) {
			throw new Error(__Annotations.FRAMEWORK_PREFIX + ".defineAnnotation(): Annotation type must be a Function.");
		}

		var namespaceName = (annotationPrefix != null ? annotationPrefix : __Annotations.NAMESPACE_PREFIX) + annotationType.name;
		if (__Annotations.ANNOTATION_TYPES[namespaceName] != null) {
			throw new Error(__Annotations.FRAMEWORK_PREFIX + ".defineAnnotation(): Annotation type has already been defined.");
		}

		var annotationTypeConstructor = function __AnnotatedTypeConstructor() {


			var annotation = {};
			annotation.constructor = annotationType;
			annotationType.apply(annotation, arguments);


			var construct = __Annotations.CONSTRUCT;
			if (construct != null && construct.constructor == Function && __Annotations.hasAnnotation(annotation.constructor, __Annotations.AnnotationTypes.MethodAnnotation)) {
				__Annotations.CONSTRUCT = construct = construct.prototype;
			}


			__Annotations.annotate(construct);


			if (__Annotations.hasAnnotation(annotation.constructor, __Annotations.AnnotationTypes.TypeAnnotation) && !__Annotations.hasAnnotation(annotation.constructor, __Annotations.AnnotationTypes.MethodAnnotation)) {
				__Annotations.CONSTRUCT = construct = null;
			}


			var unboundAnnotations = construct == null || construct.constructor == Function ? __Annotations.UNBOUND_ANNOTATIONS : __Annotations.getFrameworkState(construct).unboundAnnotations;
			unboundAnnotations.push(annotation);
		};


		__Annotations.annotate(annotationType);
		__Annotations.CONSTRUCT = null;
		__Annotations.getFrameworkState(annotationType).name = namespaceName;
		__Annotations.ANNOTATION_TYPES[namespaceName] = annotationTypeConstructor;
		__Annotations.addToNamespace(namespaceName, annotationTypeConstructor);
	},


	getAnnotatedConstructs: function GetAnnotatedConstructs() {
		var constructs = [];
		var annotatedTypes = [];
		for (var i = 0; i < arguments.length; ++i) {
			annotatedTypes.push(arguments[i]);
		}
		for (var i = 0; i < __Annotations.ANNOTATED_CONSTRUCTS.length; ++i) {
			var construct = __Annotations.ANNOTATED_CONSTRUCTS[i];
			if (!construct.systemAnnotation) {
				var args = [construct].concat(annotatedTypes);
				if (__Annotations.hasAnnotation.apply(null, args)) {
					constructs.push(construct);
				}
			}
		}
		return (constructs);
	},


	getAnnotationTypes: function GetAnnotationTypes() {
		var annotationTypes = [];
		for (var i in __Annotations.ANNOTATION_TYPES) {
			annotationTypes.push(__Annotations.ANNOTATION_TYPES[i]);
		}
		return (annotationTypes);
	},


	getAnnotations: function GetAnnotations(construct) {
		var state = __Annotations.getFrameworkState(construct);
		return (state != null ? state.annotations.slice(0) : null);
	},


	getFrameworkState: function(construct) {
		return (construct == null ? null : construct[__Annotations.FRAMEWORK_PREFIX]);
	},

	getUnboundAnnotations: function GetUnboundAnnotations(construct) {
		if (construct == null) {
			return (__Annotations.UNBOUND_ANNOTATIONS);
		}
		return (construct.__Annotations.unboundAnnotations);
	},


	initializeAliases: function InitializeAliases() {
		for (var i in __Annotations) {
			if (__Annotations[i] != null && __Annotations[i].constructor == Function && __Annotations[i].name != "") {
				var namespaceName = __Annotations.NAMESPACE_PREFIX + __Annotations[i].name;
				__Annotations.addToNamespace(namespaceName, __Annotations[i]);
				__Annotations.ALIASED_FUNCTIONS.push(namespaceName);
			}
		}
	},


	initializeAnnotationsFramework: function InitializeAnnotationsFramework() {
		__Annotations.ALIASED_FUNCTIONS = [];
		__Annotations.ANNOTATION_TYPES = {};
		__Annotations.UNBOUND_ANNOTATIONS = [];
		__Annotations.ANNOTATED_CONSTRUCTS = [];
		__Annotations.CONSTRUCT = null;
		__Annotations.initializeAliases();
		for (var i in __Annotations.AnnotationTypes) {
			var annotationType = __Annotations.AnnotationTypes[i];
			annotationType.systemAnnotation = true;
			__Annotations.defineAnnotation(annotationType);
		}
	},


	initializeFrameworkState: function(construct, constructType) {
		if (construct != null && construct[__Annotations.FRAMEWORK_PREFIX] == null) {
			construct[__Annotations.FRAMEWORK_PREFIX] = {
				constructType: constructType,
				annotations: [],
				unboundAnnotations: [],
				name: null
			};
		}
	},


	hasAnnotation: function HasAnnotation(construct) {
		for (var i = 0, annotations = __Annotations.getAnnotations(construct); annotations != null && i < annotations.length; ++i) {
			for (var j = 1; j < arguments.length; ++j) {
				if (annotations[i].constructor == arguments[j]) {
					return (true);
				}
			}
		}
		return (false);
	},


	removeAnnotationsFramework: function() {


		for (var i = 0; i < __Annotations.ALIASED_FUNCTIONS.length; ++i) {
			__Annotations.removeFromNamespace(__Annotations.ALIASED_FUNCTIONS[i]);
		}


		for (var i in __Annotations.ANNOTATION_TYPES.length) {
			var annotation = __Annotations.ANNOTATION_TYPES[i];
			__Annotations.removeFromNamespace(i);
			delete annotation[__Annotations.FRAMEWORK_PREFIX];
		}


		for (var i = 0; i < __Annotations.ANNOTATED_CONSTRUCTS.length; ++i) {
			delete __Annotations.ANNOTATED_CONSTRUCTS[i][__Annotations.FRAMEWORK_PREFIX];
		}
	},


	removeFromNamespace: function(name) {
		delete __Annotations.NAMESPACE[name];
	},


	setFrameworkPrefix: function(frameworkPrefix) {
		if (frameworkPrefix != null) {
			__Annotations.removeAnnotationsFramework();
			__Annotations.FRAMEWORK_PREFIX = frameworkPrefix.toString();
			__Annotations.initializeAnnotationsFramework();
		}
	},


	setNamespace: function(namespace) {
		if (namespace != null) {
			__Annotations.removeAnnotationsFramework();
			__Annotations.NAMESPACE = namespace;
			__Annotations.initializeAnnotationsFramework();
		}
	},


	setNamespacePrefix: function(namespacePrefix) {
		if (namespacePrefix != null) {
			__Annotations.removeAnnotationsFramework();
			__Annotations.NAMESPACE_PREFIX = namespacePrefix.toString();
			__Annotations.initializeAnnotationsFramework();
		}
	}

}

__Annotations.initializeAnnotationsFramework();
