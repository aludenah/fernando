import {test} from 'node:test';
import assert from 'node:assert/strict';
import {questionSequence, canOpenQuestion} from '../docs/sequence.js';

const task={questions:Array.from({length:4},(_,index)=>({id:`q${index+1}`,options:['A','B','C']}))};

test('a new task only opens its first question',()=>{
  const sequence=questionSequence(task,{});
  assert.equal(sequence.resumeAt,0);
  assert.equal(sequence.answered,0);
  assert.equal(sequence.percent,0);
  assert.deepEqual(task.questions.map((_,index)=>canOpenQuestion(task,{},index)),[true,false,false,false]);
});

test('any valid marked alternative unlocks the next question and keeps earlier ones available',()=>{
  for(const alternative of [0,1,2]){
    const answers={q1:alternative,q2:0};
    assert.equal(questionSequence(task,answers).resumeAt,2);
    assert.equal(questionSequence(task,answers).percent,50);
    assert.deepEqual(task.questions.map((_,index)=>canOpenQuestion(task,answers,index)),[true,true,true,false]);
  }
});

test('older out-of-order answers survive but cannot bypass an unanswered predecessor',()=>{
  const answers={q2:2,q4:1};
  assert.equal(questionSequence(task,answers).resumeAt,0);
  assert.equal(questionSequence(task,answers).answered,2);
  assert.equal(canOpenQuestion(task,answers,3),false);
  answers.q1=0;
  assert.equal(questionSequence(task,answers).resumeAt,2);
  assert.equal(canOpenQuestion(task,answers,3),false);
  answers.q3=1;
  assert.equal(questionSequence(task,answers).complete,true);
  assert.deepEqual(answers,{q1:0,q2:2,q3:1,q4:1});
});

test('finished tasks keep all questions open without requiring a downloaded copy',()=>{
  const answers={q1:0,q2:1,q3:2,q4:0};
  const sequence=questionSequence(task,answers);
  assert.equal(sequence.complete,true);
  assert.equal(sequence.percent,100);
  assert.equal(sequence.resumeAt,3);
  assert.ok(task.questions.every((_,index)=>canOpenQuestion(task,answers,index)));
  assert.equal(canOpenQuestion(task,answers,4),false);
});

test('invalid alternatives and invalid navigation targets do not unlock questions',()=>{
  for(const value of [-1,3,'0',null,NaN])assert.equal(canOpenQuestion(task,{q1:value},1),false);
  for(const index of [-1,0.5,'0',NaN,Infinity])assert.equal(canOpenQuestion(task,{},index),false);
  const single={questions:[task.questions[0]]};
  assert.equal(questionSequence(single,{}).complete,false);
  assert.equal(questionSequence(single,{q1:0}).percent,100);
});
