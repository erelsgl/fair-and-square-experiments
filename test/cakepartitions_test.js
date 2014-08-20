/**
 * a unit-test for ValueFunction1D
 * 
 * @author Erel Segal-Halevi
 * @since 2014-08
 */

var should = require('should');
var ValueFunction1D = require("../lib/ValueFunction1D");
var cakepartitions = require("../lib/cakepartitions");

// parts:
var a1 = new ValueFunction1D([1,2,3,4],0,2);
var a2 = new ValueFunction1D([1,2,3,4],2,4);
var b1 = new ValueFunction1D([4,3,2,1],0,2);
var b2 = new ValueFunction1D([4,3,2,1],2,4);

// partitions:
var a1a2 = [a1,a2]
  , a1b2 = [a1,b2]
  , b1a2 = [b1,a2]
  , b1b2 = [b1,b2]

describe('cakepartitions', function() {
	it('egalitarianValue', function() {
		cakepartitions.egalitarianValue(a1a2).should.equal(0.3);
		cakepartitions.egalitarianValue(a1b2).should.equal(0.3);
		cakepartitions.egalitarianValue(b1a2).should.equal(0.7);
		cakepartitions.egalitarianValue(b1b2).should.equal(0.3);
	})
	it('normalizedEgalitarianValue', function() {
		cakepartitions.normalizedEgalitarianValue(a1a2).should.equal(0.6);
		cakepartitions.normalizedEgalitarianValue(a1b2).should.equal(0.6);
		cakepartitions.normalizedEgalitarianValue(b1a2).should.equal(1.4);
		cakepartitions.normalizedEgalitarianValue(b1b2).should.equal(0.6);
	})
	it('utilitarianValue', function() {
		cakepartitions.utilitarianValue(a1a2).should.equal(1);
		cakepartitions.utilitarianValue(a1b2).should.equal(0.6);
		cakepartitions.utilitarianValue(b1a2).should.equal(1.4);
		cakepartitions.utilitarianValue(b1b2).should.equal(1);
	})
	it('largestEnvyOfAgent', function() {
		cakepartitions.largestEnvyOfAgent(a1,a1a2).should.equal(4/3);
	})
	it('largestEnvy', function() {
		cakepartitions.largestEnvy(a1a2).should.equal(4/3);
		cakepartitions.largestEnvy(a1b2).should.equal(4/3);
		cakepartitions.largestEnvy(b1a2).should.equal(0);
		cakepartitions.largestEnvy(b1b2).should.equal(4/3);
	})
})


