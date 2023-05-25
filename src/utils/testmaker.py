"""
    @file testmaker.py
    @description Contains skeleton code for the word sequence generator.
    @author Derek Tan
"""

DUMMY_TEXT = 'the fox leaps over the fence to grab a snack.'

def word_generator(word_bank, difficulty_table):
    """
        @todo Implement a word generator with weights based on calculated word difficulty.
    """
    pass

def generate_prose(use_dummy: bool, word_bank, difficulty_table: dict):
    """
        @description Generates a sequence of words for typing (ending '.' character needed). Must reuse `word_generator` function later!
        @param use_dummy Whether to return the dummy text or not. 
        @param word_bank A collection of words. Whether this is a list, dict, or another data structure is undetermined. 
        @param difficulty_table A dict mapping key letters to difficulty (distance from middle keyboard).
    """
    if use_dummy:
        return DUMMY_TEXT
    else:
        return None # todo: call word_generator multiple times... may depend on previous tests' hardness and this new test.
