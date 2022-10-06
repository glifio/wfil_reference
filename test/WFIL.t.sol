// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.15;

import {SafeTransferLib} from "solmate/utils/SafeTransferLib.sol";
import {DSInvariantTest} from "solmate/test/utils/DSInvariantTest.sol";
import {WFIL} from "src/WFIL.sol";
import "forge-std/Test.sol";

contract WETHTest is Test {
    WFIL wfil;

    function setUp() public {
        wfil = new WFIL();
    }

    function testFallbackDeposit() public {
        assertEq(wfil.balanceOf(address(this)), 0);
        assertEq(wfil.totalSupply(), 0);

        SafeTransferLib.safeTransferETH(address(wfil), 1*1e18);

        assertEq(wfil.balanceOf(address(this)), 1*1e18);
        assertEq(wfil.totalSupply(), 1*1e18);
    }

    function testDeposit() public {
        assertEq(wfil.balanceOf(address(this)), 0);
        assertEq(wfil.totalSupply(), 0);

        wfil.deposit{value: 1*1e18}();

        assertEq(wfil.balanceOf(address(this)), 1*1e18);
        assertEq(wfil.totalSupply(), 1*1e18);
    }

    function testWithdraw() public {
        uint256 startingBalance = address(this).balance;

        wfil.deposit{value: 1*1e18}();

        wfil.withdraw(1*1e18);

        uint256 balanceAfterWithdraw = address(this).balance;

        assertEq(balanceAfterWithdraw, startingBalance);
        assertEq(wfil.balanceOf(address(this)), 0);
        assertEq(wfil.totalSupply(), 0);
    }

    function testPartialWithdraw() public {
        wfil.deposit{value: 1*1e18}();

        uint256 balanceBeforeWithdraw = address(this).balance;

        wfil.withdraw(0.5 ether);

        uint256 balanceAfterWithdraw = address(this).balance;

        assertEq(balanceAfterWithdraw, balanceBeforeWithdraw + 0.5 ether);
        assertEq(wfil.balanceOf(address(this)), 0.5 ether);
        assertEq(wfil.totalSupply(), 0.5 ether);
    }

    function testFallbackDeposit(uint256 amount) public {
        amount = bound(amount, 0, address(this).balance);

        assertEq(wfil.balanceOf(address(this)), 0);
        assertEq(wfil.totalSupply(), 0);

        SafeTransferLib.safeTransferETH(address(wfil), amount);

        assertEq(wfil.balanceOf(address(this)), amount);
        assertEq(wfil.totalSupply(), amount);
    }

    function testDeposit(uint256 amount) public {
        amount = bound(amount, 0, address(this).balance);

        assertEq(wfil.balanceOf(address(this)), 0);
        assertEq(wfil.totalSupply(), 0);

        wfil.deposit{value: amount}();

        assertEq(wfil.balanceOf(address(this)), amount);
        assertEq(wfil.totalSupply(), amount);
    }

    function testWithdraw(uint256 depositAmount, uint256 withdrawAmount) public {
        depositAmount = bound(depositAmount, 0, address(this).balance);
        withdrawAmount = bound(withdrawAmount, 0, depositAmount);

        wfil.deposit{value: depositAmount}();

        uint256 balanceBeforeWithdraw = address(this).balance;

        wfil.withdraw(withdrawAmount);

        uint256 balanceAfterWithdraw = address(this).balance;

        assertEq(balanceAfterWithdraw, balanceBeforeWithdraw + withdrawAmount);
        assertEq(wfil.balanceOf(address(this)), depositAmount - withdrawAmount);
        assertEq(wfil.totalSupply(), depositAmount - withdrawAmount);
    }

    receive() external payable {}
}

contract WFILInvariants is Test, DSInvariantTest {
    WFILTester wfilTester;
    WFIL wfil;

    function setUp() public {
        wfil = new WFIL();
        wfilTester = new WFILTester{value: address(this).balance}(wfil);

        addTargetContract(address(wfilTester));
    }

    function invariantTotalSupplyEqualsBalance() public {
        assertEq(address(wfil).balance, wfil.totalSupply());
    }
}

contract WFILTester {
    WFIL wfil;

    constructor(WFIL _wfil) payable {
        wfil = _wfil;
    }

    function deposit(uint256 amount) public {
        wfil.deposit{value: amount}();
    }

    function fallbackDeposit(uint256 amount) public {
        SafeTransferLib.safeTransferETH(address(wfil), amount);
    }

    function withdraw(uint256 amount) public {
        wfil.withdraw(amount);
    }

    receive() external payable {}
}
