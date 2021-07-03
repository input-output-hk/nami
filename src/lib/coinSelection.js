import {
  TransactionUnspentOutput,
  TransactionOutputs,
  Value,
} from '@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';
import Loader from '../api/loader';
/**
 * BerryPool implementation of the __Random-Improve__ coin selection algorithm.
 *
 * = Overview
 *
 * The __Random-Improve__ coin selection algorithm works in __two phases__, by
 * /first/ selecting UTxO entries /at random/ to pay for each of the given
 * outputs, and /then/ attempting to /improve/ upon each of the selections.
 *
 * === Phase 1: Random Selection
 *
 * __In this phase, the algorithm randomly selects a minimal set of UTxO__
 * __entries to pay for each of the given outputs.__
 *
 * During this phase, the algorithm:
 *
 *   *  processes outputs in /descending order of coin value/.
 *
 *   *  maintains a /remaining UTxO set/, initially equal to the given
 *      /UTxO set/ parameter.
 *
 *   *  based on every output nature, generate a /native token UTxO subset/
 *      to narrow down to useful UTxO
 *
 *   *  maintains an /accumulated coin selection/, which is initially /empty/.
 *
 * For each output of value __/v/__, the algorithm /randomly/ selects entries
 * from the /remaining UTxO set/, until the total value of selected entries is
 * greater than or equal to __/v/__. The selected entries are then associated
 * with that output, and removed from the /remaining UTxO set/.
 *
 * This phase ends when every output has been associated with a selection of
 * UTxO entries.
 *
 * However, if the remaining UTxO set is completely exhausted before all
 * outputs can be processed, the algorithm terminates with an error.
 *
 * === Phase 2: Improvement
 *
 * __In this phase, the algorithm attempts to improve upon each of the UTxO__
 * __selections made in the previous phase, by conservatively expanding the__
 * __selection made for each output.__
 *
 * During this phase, the algorithm:
 *
 *   *  processes outputs in /ascending order of coin value/.
 *
 *   *  continues to maintain the /remaining UTxO set/ produced by the previous
 *      phase.
 *
 *   *  maintains an /accumulated coin selection/, initiated from previous phase.
 *
 * For each output of value __/v/__, the algorithm:
 *
 *  1.  __Calculates a /target range/__ for the total value of inputs used to
 *      pay for that output, defined by the triplet:
 *
 *      (/minimum/, /ideal/, /maximum/) = (/v/, /2v/, /3v/)
 *
 *  2.  __Attempts to /improve/ upon the /existing UTxO selection/__ for that
 *      output, by repeatedly selecting additional entries at random from the
 *      /remaining UTxO set/, stopping when the selection can be improved upon
 *      no further.
 *
 *      A selection with value /v1/ is considered to be an /improvement/ over a
 *      selection with value /v0/ if __all__ of the following conditions are
 *      satisfied:
 *
 *       * __Condition 1__: we have moved closer to the /ideal/ value:
 *
 *             abs (/ideal/ − /v1/) < abs (/ideal/ − /v0/)
 *
 *       * __Condition 2__: we have not exceeded the /maximum/ value:
 *
 *             /v1/ ≤ /maximum/
 *
 *       * __Condition 3__: when counting cumulatively across all outputs
 *       considered so far, we have not selected more than the /maximum/ number
 *       of UTxO entries specified by 'limit'.
 *
 *  3.  __Creates a /change value/__ for the output, equal to the total value
 *      of the /final UTxO selection/ for that output minus the value /v/ of
 *      that output.
 *
 *  4.  __Updates the /accumulated coin selection/__:
 *
 *       * Adds the /output/ to 'outputs'.
 *       * Adds the /improved UTxO selection/ to 'inputs'.
 *       * Adds the /change value/ to 'change'.
 *
 * This phase ends when every output has been processed, __or__ when the
 * /remaining UTxO set/ has been exhausted, whichever occurs sooner.
 *
 * = Termination
 *
 * When both phases are complete, the algorithm terminates.
 *
 * The /accumulated coin selection/ and /remaining UTxO set/ are returned to
 * the caller.
 *
 * === Failure Modes
 *
 * The algorithm terminates with an __error__ if:
 *
 *  1.  The /total value/ of the initial UTxO set (the amount of money
 *      /available/) is /less than/ the total value of the output list (the
 *      amount of money /required/).
 *
 *      See: __'InputsExhaustedError'__.
 *
 *  2.  The /number/ of UTxO entries needed to pay for the requested outputs
 *      would /exceed/ the upper limit specified by 'limit'.
 *
 *      See: __'InputLimitExceededError'__.
 *
 * == Motivating Principles
 *
 * There are several motivating principles behind the design of the algorithm.
 *
 * === Principle 1: Dust Management
 *
 * The probability that random selection will choose dust entries from a UTxO
 * set increases with the proportion of dust in the set.
 *
 * Therefore, for a UTxO set with a large amount of dust, there's a high
 * probability that a random subset will include a large amount of dust.
 *
 * === Principle 2: Change Management
 *
 * Ideally, coin selection algorithms should, over time, create a UTxO set that
 * has /useful/ outputs: outputs that will allow us to process future payments
 * with a minimum number of inputs.
 *
 * If for each payment request of value __/v/__ we create a change output of
 * /roughly/ the same value __/v/__, then we will end up with a distribution of
 * change values that matches the typical value distribution of payment
 * requests.
 *
 * === Principle 3: Performance Management
 *
 * Searching the UTxO set for additional entries to improve our change outputs
 * is /only/ useful if the UTxO set contains entries that are sufficiently
 * small enough. But it is precisely when the UTxO set contains many small
 * entries that it is less likely for a randomly-chosen UTxO entry to push the
 * total above the upper bound.
 */

/**
 * @typedef {Value[]} AmountList - List of 'Value' object
 */

/**
 * @typedef {TransactionUnspentOutput[]} UTxOList - List of UTxO
 */

/**
 * @typedef {Object} UTxOSelection - Coin Selection algorithm core object
 * @property {UTxOList} selection - Accumulated UTxO set.
 * @property {UTxOList} remaining - Remaining UTxO set.
 * @property {UTxOList} subset - Remaining UTxO set.
 * @property {Value} amount - UTxO amount of each requested token
 * @property {Value} change - Accumulated change amount.
 */

/**
 * @typedef {Object} ImproveRange - ImproveRange
 * @property {Value} ideal - Requested amount * 2
 * @property {Value} maximum - Requested amount * 3
 */

/**
 * @typedef {Object} SelectionResult - Coin Selection algorithm return
 * @property {UTxOList} input - Accumulated UTxO set.
 * @property {OutputList} output - Requested outputs.
 * @property {UTxOList} remaining - Remaining UTxO set.
 * @property {Value} amount - UTxO amount of each requested token
 * @property {Value} change - Accumulated change amount.
 */

/**
 * CoinSelection Module.
 * @module src/lib/CoinSelection
 */
const CoinSelection = {
  /**
   * Random-Improve coin selection algorithm
   * @param {UTxOList} inputs - The set of inputs available for selection.
   * @param {TransactionOutputs} outputs - The set of outputs requested for payment.
   * @param {int} limit - A limit on the number of inputs that can be selected.
   * @param {int} minUTxOValue - Network protocol 'minUTxOValue' current value
   * @return {SelectionResult} - Coin Selection algorithm return
   */
  randomImprove: async (inputs, outputs, limit, minUTxOValue) => {
    await Loader.load();
    /** @type {UTxOSelection} */
    let utxoSelection = {
      selection: [],
      remaining: [...inputs], // Shallow copy
      subset: [],
      amount: Loader.Cardano.Value.new(Loader.Cardano.BigNum.from_str('0')),
      change: Loader.Cardano.Value.new(Loader.Cardano.BigNum.from_str('0')),
    };

    let mergedOutputs = mergeOutputsAmounts(outputs);
    // Explode amount in an array of unique asset amount for comparison's sake
    let splitOutputs = splitAmounts(mergedOutputs);

    // Phase 1: RandomSelect
    splitOutputs = sortAmountList(splitOutputs, 'DESC');

    splitOutputs.forEach((output) => {
      createSubSet(utxoSelection, output); // Narrow down for NatToken UTxO

      try {
        utxoSelection = randomSelect(
          cloneUTxOSelection(utxoSelection), // Deep copy in case of fallback needed
          output,
          limit - utxoSelection.selection.length,
          minUTxOValue
        );
      } catch (e) {
        if (e.message === 'INPUT_LIMIT_EXCEEDED') {
          // Limit reached : Fallback on DescOrdAlgo
          utxoSelection = descSelect(
            utxoSelection,
            output,
            limit - utxoSelection.selection.length,
            minUTxOValue
          );
        } else {
          throw e;
        }
      }
    });

    // Phase 2: Improve
    splitOutputs.reverse();

    splitOutputs.forEach((output) => {
      createSubSet(utxoSelection, output); // Narrow down for NatToken UTxO

      let range = {};
      range.ideal = Loader.Cardano.Value.new(
        Loader.Cardano.BigNum.from_str('0')
      )
        .checked_add(output)
        .checked_add(output);
      range.maximum = Loader.Cardano.Value.new(
        Loader.Cardano.BigNum.from_str('0')
      )
        .checked_add(range.ideal)
        .checked_add(output);

      improve(
        utxoSelection,
        output,
        limit - utxoSelection.selection.length,
        range
      );
    });

    return {
      input: utxoSelection.selection,
      output: outputs,
      remaining: utxoSelection.remaining,
      amount: utxoSelection.amount,
      change: calculateChange(utxoSelection.selection, mergedOutputs),
    };
  },
};

/**
 * Randomly select enough UTxO to fulfill requested outputs
 * @param {UTxOSelection} utxoSelection - The set of selected/available inputs.
 * @param {Value} outputAmount - Single compiled output qty requested for payment.
 * @param {int} limit - A limit on the number of inputs that can be selected.
 * @param {int} minUTxOValue - Network protocol 'minUTxOValue' current value.
 * @throws INPUT_LIMIT_EXCEEDED if the number of randomly picked inputs exceed 'limit' parameter.
 * @throws INPUTS_EXHAUSTED if all UTxO doesn't hold enough funds to pay for output.
 * @throws MIN_UTXO_ERROR if lovelace change is under 'minUTxOValue' parameter.
 * @return {UTxOSelection} - Successful random utxo selection.
 */
function randomSelect(utxoSelection, outputAmount, limit, minUTxOValue) {
  // If quantity is met, return subset into remaining list and exit
  if (isQtyFulfilled(outputAmount, utxoSelection.amount, minUTxOValue)) {
    utxoSelection.remaining = [
      ...utxoSelection.remaining,
      ...utxoSelection.subset,
    ];
    utxoSelection.subset = [];
    return utxoSelection;
  }

  if (limit <= 0) {
    throw new Error('INPUT_LIMIT_EXCEEDED');
  }

  let nbFreeUTxO = utxoSelection.subset.length;

  if (nbFreeUTxO <= 0) {
    if (isQtyFulfilled(outputAmount, utxoSelection.amount, 0)) {
      throw new Error('MIN_UTXO_ERROR');
    }
    throw new Error('INPUTS_EXHAUSTED');
  }

  /** @type {TransactionUnspentOutput} utxo */
  let utxo = utxoSelection.subset
    .splice(Math.floor(Math.random() * nbFreeUTxO), 1)
    .pop();

  utxoSelection.selection.push(utxo);
  utxoSelection.amount = addAmounts(
    utxo.output().amount(),
    utxoSelection.amount
  );

  return randomSelect(utxoSelection, outputAmount, limit - 1, minUTxOValue);
}

/**
 * Select enough UTxO in DESC order to fulfill requested outputs
 * @param {UTxOSelection} utxoSelection - The set of selected/available inputs.
 * @param {Value} outputAmount - Single compiled output qty requested for payment.
 * @param {int} limit - A limit on the number of inputs that can be selected.
 * @param {int} minUTxOValue - Network protocol 'minUTxOValue' current value.
 * @throws INPUT_LIMIT_EXCEEDED if the number of randomly picked inputs exceed 'limit' parameter.
 * @throws INPUTS_EXHAUSTED if all UTxO doesn't hold enough funds to pay for output.
 * @throws MIN_UTXO_ERROR if lovelace change is under 'minUTxOValue' parameter.
 * @return {UTxOSelection} - Successful random utxo selection.
 */
function descSelect(utxoSelection, outputAmount, limit, minUTxOValue) {
  // Sort UTxO subset in DESC order for required Output unit type
  utxoSelection.subset = utxoSelection.subset.sort((utxoA, utxoB) =>
    utxoB.output().amount().compare(utxoA.output().amount())
  );

  do {
    if (limit <= 0) {
      throw new Error('INPUT_LIMIT_EXCEEDED');
    }

    if (utxoSelection.subset.length <= 0) {
      if (isQtyFulfilled(outputAmount, utxoSelection.amount, 0)) {
        throw new Error('MIN_UTXO_ERROR');
      }
      throw new Error('INPUTS_EXHAUSTED');
    }

    /** @type {TransactionUnspentOutput} utxo */
    let utxo = utxoSelection.subset.splice(0, 1).pop();

    utxoSelection.selection.push(utxo);
    utxoSelection.amount = addAmounts(
      utxo.output().amount(),
      utxoSelection.amount
    );

    limit--;
  } while (!isQtyFulfilled(outputAmount, utxoSelection.amount, minUTxOValue));

  // Quantity is met, return subset into remaining list and return selection
  utxoSelection.remaining = [
    ...utxoSelection.remaining,
    ...utxoSelection.subset,
  ];
  utxoSelection.subset = [];

  return utxoSelection;
}

/**
 * Try to improve selection by increasing input amount in [2x,3x] range.
 * @param {UTxOSelection} utxoSelection - The set of selected/available inputs.
 * @param {Value} outputAmount - Single compiled output qty requested for payment.
 * @param {int} limit - A limit on the number of inputs that can be selected.
 * @param {ImproveRange} range - Improvement range target values
 */
function improve(utxoSelection, outputAmount, limit, range) {
  let nbFreeUTxO = utxoSelection.subset.length;

  if (
    utxoSelection.amount.compare(range.ideal) >= 0 ||
    nbFreeUTxO <= 0 ||
    limit <= 0
  ) {
    // Return subset in remaining
    utxoSelection.remaining = [
      ...utxoSelection.remaining,
      ...utxoSelection.subset,
    ];
    utxoSelection.subset = [];

    return;
  }

  /** @type {TransactionUnspentOutput} utxo */
  const utxo = utxoSelection.subset
    .splice(Math.floor(Math.random() * nbFreeUTxO), 1)
    .pop();

  const newAmount = Loader.Cardano.Value.new(
    Loader.Cardano.BigNum.from_str('0')
  )
    .checked_add(utxo.output().amount())
    .checked_add(outputAmount);

  if (
    abs(getAmountValue(range.ideal) - getAmountValue(newAmount)) <
      abs(getAmountValue(range.ideal) - getAmountValue(outputAmount)) &&
    newAmount.compare(range.maximum) <= 0
  ) {
    utxoSelection.selection.push(utxo);
    utxoSelection.amount = addAmounts(
      utxo.output().amount(),
      utxoSelection.amount
    );
    limit--;
  } else {
    utxoSelection.remaining.push(utxo);
  }

  return improve(utxoSelection, outputAmount, limit, range);
}

/**
 * Compile all required outputs to a flat amounts list
 * @param {TransactionOutputs} outputs - The set of outputs requested for payment.
 * @return {Value} - The compiled set of amounts requested for payment.
 */
function mergeOutputsAmounts(outputs) {
  let compiledAmountList = Loader.Cardano.Value.new(
    Loader.Cardano.BigNum.from_str('0')
  );
  compiledAmountList.set_multiasset(Loader.Cardano.MultiAsset.new());

  for (let i = 0; i < outputs.len(); i++) {
    compiledAmountList = addAmounts(
      outputs.get(i).amount(),
      compiledAmountList
    );
  }

  return compiledAmountList;
}

/**
 * Add up an Amounts List values to another Amounts List
 * @param {Value} amounts - Set of amounts to be added.
 * @param {Value} compiledAmounts - The compiled set of amounts.
 * @return {Value}
 */
function addAmounts(amounts, compiledAmounts) {
  return compiledAmounts.checked_add(amounts);
}

/**
 * Split amounts contained in a single {Value} object in separate {Value} objects
 * @param {Value} amounts - Set of amounts to be split.
 * @throws MIN_UTXO_ERROR if lovelace change is under 'minUTxOValue' parameter.
 * @return {AmountList}
 */
function splitAmounts(amounts) {
  let splitAmounts = [];
  if (isNaN(amounts.coin().to_str())) throw new Error('MIN_UTXO_ERROR');

  splitAmounts.push(Loader.Cardano.Value.new(amounts.coin()));

  if (amounts.multiasset() && amounts.multiasset().len()) {
    for (let i = 0; i < amounts.multiasset().len(); i++) {
      let scriptHash = amounts.multiasset().keys().get(i);
      for (let j = 0; j < amounts.multiasset().get(scriptHash).len(); j++) {
        let value = Loader.Cardano.Value.new(
          Loader.Cardano.BigNum.from_str('0')
        );
        value.set_multiasset(Loader.Cardano.MultiAsset.new());

        let assets = Loader.Cardano.Assets.new();
        let assetName = amounts.multiasset().get(scriptHash).keys().get(j);
        assets.insert(
          assetName,
          amounts.multiasset().get(scriptHash).get(assetName)
        );

        value.multiasset().insert(scriptHash, assets);

        splitAmounts.push(value);
      }
    }
  }

  return splitAmounts;
}

/**
 * Sort a mismatched AmountList ASC/DESC
 * @param {AmountList} amountList - Set of mismatched amounts to be sorted.
 * @param {string} [sortOrder=ASC] - Order
 * @return {AmountList} - The sorted AmountList
 */
function sortAmountList(amountList, sortOrder = 'ASC') {
  return amountList.sort((a, b) => {
    let sortInt = sortOrder === 'DESC' ? BigInt(-1) : BigInt(1);
    return Number((getAmountValue(a) - getAmountValue(b)) * sortInt);
  });
}

/**
 * Return BigInt amount value
 * @param amount
 * @return {bigint}
 */
function getAmountValue(amount) {
  let val = BigInt(0);
  let lovelace = BigInt(amount.coin().to_str());

  if (lovelace > 0) {
    val = lovelace;
  } else if (amount.multiasset() && amount.multiasset().len() > 0) {
    let scriptHash = amount.multiasset().keys().get(0);
    let assetName = amount.multiasset().get(scriptHash).keys().get(0);
    val = BigInt(amount.multiasset().get(scriptHash).get(assetName).toString());
  }

  return val;
}

/**
 * Narrow down remaining UTxO set in case of native token, use full set for lovelace
 * @param {UTxOSelection} utxoSelection - The set of selected/available inputs.
 * @param {Value} output - Single compiled output qty requested for payment.
 */
function createSubSet(utxoSelection, output) {
  if (BigInt(output.coin().to_str()) < 1) {
    utxoSelection.remaining.forEach((utxo, index) => {
      if (output.compare(utxo.output().amount()) !== undefined) {
        utxoSelection.subset.push(
          utxoSelection.remaining.splice(index, 1).pop()
        );
      }
    });
  } else {
    utxoSelection.subset = utxoSelection.remaining.splice(
      0,
      utxoSelection.remaining.length
    );
  }
}

/**
 * Push extra UTxO assets in change
 * @param {UTxOList} selection - The set of selected/available inputs.
 * @param {Value} outputAmount - Compiled output amounts requested for payment.
 */
function calculateChange(selection, outputAmount) {
  const selectionAmountList = selection.map((utxo) => utxo.output().amount());
  let selectionAmount = Loader.Cardano.Value.new(
    Loader.Cardano.BigNum.from_str('0')
  );

  selectionAmountList.forEach(
    (amount) => (selectionAmount = selectionAmount.checked_add(amount))
  );

  return selectionAmount.checked_sub(outputAmount);
}

/**
 * Is Quantity Fulfilled Condition - Handle 'minUTxOValue' protocol parameter.
 * @param {Value} outputAmount - Single compiled output qty requested for payment.
 * @param {Value} cumulatedAmount - Single compiled accumulated UTxO qty.
 * @param {int} minUTxOValue - Network protocol 'minUTxOValue' current value
 * @return {boolean}
 */
function isQtyFulfilled(outputAmount, cumulatedAmount, minUTxOValue) {
  let amount = outputAmount;

  if (BigInt(amount.coin().to_str()) > 0) {
    let minAmount = Loader.Cardano.Value.new(
      Loader.Cardano.min_ada_required(
        cumulatedAmount,
        Loader.Cardano.BigNum.from_str(minUTxOValue.toString())
      )
    );
    amount = Loader.Cardano.Value.new(amount.coin());
    amount = amount.checked_add(minAmount);
  }

  return cumulatedAmount.compare(amount) >= 0;
}

/**
 * Return a deep copy of UTxOSelection
 * @param {UTxOSelection} utxoSelection
 * @return {UTxOSelection} Clone - Deep copy
 */
function cloneUTxOSelection(utxoSelection) {
  return {
    selection: cloneUTxOList(utxoSelection.selection),
    remaining: cloneUTxOList(utxoSelection.remaining),
    subset: cloneUTxOList(utxoSelection.subset),
    amount: cloneValue(utxoSelection.amount),
    change: cloneValue(utxoSelection.change),
  };
}

/**
 * Return a deep copy of an UTxO List
 * @param {UTxOList} utxoList
 * @return {UTxOList} Cone - Deep copy
 */
const cloneUTxOList = (utxoList) =>
  utxoList.map((utxo) =>
    Loader.Cardano.TransactionUnspentOutput.from_bytes(utxo.to_bytes())
  );

/**
 * Return a deep copy of a Value object
 * @param {Value} value
 * @return {Value} Cone - Deep copy
 */
const cloneValue = (value) => Loader.Cardano.Value.from_bytes(value.to_bytes());

// Helper
function abs(big) {
  return big < 0 ? big * BigInt(-1) : big;
}

export default CoinSelection;
